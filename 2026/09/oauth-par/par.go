package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

type httpDoer interface {
	Do(*http.Request) (*http.Response, error)
}

type parResponse struct {
	RequestURI string `json:"request_uri"`
	ExpiresIn  int    `json:"expires_in"`
}

type parRequestError struct {
	StatusCode  int
	OAuthError  string
	Description string
}

func (e *parRequestError) Error() string {
	message := fmt.Sprintf("PAR endpoint returned status %d", e.StatusCode)
	if e.OAuthError != "" {
		message += ": " + e.OAuthError
	}
	if e.Description != "" {
		message += ": " + e.Description
	}
	return message
}

func pushAuthorizationRequest(
	client httpDoer,
	endpoint string,
	clientID string,
	clientSecret string,
	redirectURI string,
	state string,
	nonce string,
	challenge string,
) (*parResponse, error) {
	form := url.Values{}
	form.Set("response_type", "code")
	form.Set("client_id", clientID)
	form.Set("redirect_uri", redirectURI)
	form.Set("scope", "openid")
	form.Set("state", state)
	form.Set("nonce", nonce)
	form.Set("code_challenge", challenge)
	form.Set("code_challenge_method", "S256")

	req, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, fmt.Errorf("create PAR request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	// RFC 6749 requires each client credential to be form-encoded before it is
	// used as the username or password in HTTP Basic authentication.
	req.SetBasicAuth(url.QueryEscape(clientID), url.QueryEscape(clientSecret))

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("PAR request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		var oauthError struct {
			Error            string `json:"error"`
			ErrorDescription string `json:"error_description"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&oauthError)
		return nil, &parRequestError{
			StatusCode:  resp.StatusCode,
			OAuthError:  oauthError.Error,
			Description: oauthError.ErrorDescription,
		}
	}

	var result parResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode PAR response: %w", err)
	}
	if result.RequestURI == "" || result.ExpiresIn <= 0 {
		return nil, fmt.Errorf("invalid success response: request_uri must be non-empty and expires_in must be positive")
	}
	return &result, nil
}

func buildPARAuthorizationURL(authEndpoint, clientID, requestURI string) string {
	query := url.Values{}
	query.Set("client_id", clientID)
	query.Set("request_uri", requestURI)
	return authEndpoint + "?" + query.Encode()
}
