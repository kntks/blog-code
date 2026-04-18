package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

func (s *server) handleLogin(w http.ResponseWriter, r *http.Request) {
	state, err := randomString(32)
	if err != nil {
		http.Error(w, "failed to generate state", http.StatusInternalServerError)
		return
	}
	nonce, err := randomString(32)
	if err != nil {
		http.Error(w, "failed to generate nonce", http.StatusInternalServerError)
		return
	}
	verifier, err := randomString(64)
	if err != nil {
		http.Error(w, "failed to generate pkce verifier", http.StatusInternalServerError)
		return
	}
	challenge := pkceChallengeS256(verifier)

	setCookie(w, stateCookieName, state, 5*time.Minute)
	setCookie(w, nonceCookieName, nonce, 5*time.Minute)
	setCookie(w, pkceCookieName, verifier, 5*time.Minute)

	authURL := buildAuthURL(
		s.discovery.AuthorizationEndpoint,
		s.config.clientID,
		s.config.redirectURL,
		state,
		nonce,
		challenge,
	)
	http.Redirect(w, r, authURL, http.StatusFound)
}

func (s *server) handleCallback(w http.ResponseWriter, r *http.Request) {
	if authErr := r.URL.Query().Get("error"); authErr != "" {
		message := authErr
		if description := r.URL.Query().Get("error_description"); description != "" {
			message += ": " + description
		}
		http.Error(w, message, http.StatusBadRequest)
		return
	}

	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")
	if state == "" || code == "" {
		http.Error(w, "missing state or code", http.StatusBadRequest)
		return
	}
	if !s.validateState(r, state) {
		http.Error(w, "invalid state", http.StatusBadRequest)
		return
	}

	nonce, err := readCookie(r, nonceCookieName)
	if err != nil {
		http.Error(w, "nonce cookie missing", http.StatusBadRequest)
		return
	}
	verifier, err := readCookie(r, pkceCookieName)
	if err != nil {
		http.Error(w, "pkce verifier missing", http.StatusBadRequest)
		return
	}

	tr, err := exchangeCode(
		s.discovery.TokenEndpoint,
		s.config.clientID,
		s.config.clientSecret,
		code,
		s.config.redirectURL,
		verifier,
	)
	if err != nil {
		log.Printf("token exchange error: %v", err)
		http.Error(w, "failed to exchange token", http.StatusBadRequest)
		return
	}

	fmt.Printf("ID Token (JWE): %+v\n", tr.IDToken)
	normalizedIDToken, err := normalizeIDToken(tr.IDToken)
	if err != nil {
		log.Printf("id_token normalization error: %v", err)
		http.Error(w, "failed to process id_token", http.StatusBadRequest)
		return
	}

	fmt.Printf("ID Token (JWS): %+v\n", normalizedIDToken)
	if _, err := verifyIDToken(normalizedIDToken, s.jwks, s.config.clientID, s.discovery.Issuer, nonce); err != nil {
		log.Printf("id_token verification error: %v", err)
		http.Error(w, "invalid id_token", http.StatusBadRequest)
		return
	}

	setCookie(w, idTokenCookie, normalizedIDToken, time.Hour)
	setCookie(w, accessTokenCookie, tr.AccessToken, time.Hour)
	clearCookie(w, stateCookieName)
	clearCookie(w, nonceCookieName)
	clearCookie(w, pkceCookieName)
	http.Redirect(w, r, "/home", http.StatusFound)
}

func (s *server) handleHome(w http.ResponseWriter, r *http.Request) {
	idToken, err := readCookie(r, idTokenCookie)
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}

	idToken, err = normalizeIDToken(idToken)
	if err != nil {
		log.Printf("id_token normalization error: %v", err)
		clearCookie(w, idTokenCookie)
		clearCookie(w, accessTokenCookie)
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}

	// nonce は /callback で検証済みのためスキップ
	idClaims, err := verifyIDToken(idToken, s.jwks, s.config.clientID, s.discovery.Issuer, "")
	if err != nil {
		clearCookie(w, idTokenCookie)
		clearCookie(w, accessTokenCookie)
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}

	var accessRows []claimRow
	if rawAT, err := readCookie(r, accessTokenCookie); err == nil {
		if atClaims, err := parseTokenClaims(rawAT, s.jwks); err == nil {
			accessRows = claimsToRows(atClaims)
		} else {
			log.Printf("access token parse error: %v", err)
		}
	}

	data := struct {
		AccessClaims []claimRow
		IDClaims     []claimRow
	}{
		AccessClaims: accessRows,
		IDClaims:     claimsToRows(idClaims),
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := homeTmpl.Execute(w, data); err != nil {
		log.Printf("template execute error: %v", err)
	}
}

// handleClientJWKS serves the client's public key as a JWK Set (RFC 7517 §5).
// Keycloak uses this endpoint to fetch the public key used for JWE-encrypted
// ID tokens.
func (s *server) handleClientJWKS(w http.ResponseWriter, r *http.Request) {
	key, err := clientPublicJWKFromPEM()
	if err != nil {
		log.Printf("client jwks error: %v", err)
		http.Error(w, "failed to build JWKS", http.StatusInternalServerError)
		return
	}

	resp := struct {
		Keys []*jwk `json:"keys"`
	}{
		Keys: []*jwk{key},
	}

	w.Header().Set("Content-Type", "application/jwk-set+json")
	w.Header().Set("Cache-Control", "no-store")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		log.Printf("client jwks encode error: %v", err)
	}
}

func (s *server) validateState(r *http.Request, state string) bool {
	stored, err := readCookie(r, stateCookieName)
	if err != nil {
		return false
	}
	return stored == state
}
