package main

import (
	"errors"
	"fmt"
	"os"
	"strings"
)

// JARSigningKey controls which key is used to sign the JAR request object.
type JARSigningKey string

const (
	// JARSigningKeyRSA signs the request object with the embedded RSA private key (RS256). Default.
	JARSigningKeyRSA JARSigningKey = "rsa"
	// JARSigningKeyClientSecret signs the request object with the client secret (HS256).
	// Useful when the authorization server (e.g. Keycloak) is configured to accept HMAC-signed request objects.
	JARSigningKeyClientSecret JARSigningKey = "clientSecret"
)

// JARMode controls how JAR (JWT-Secured Authorization Request) is used.
type JARMode string

const (
	// JARModeNone sends a plain OAuth2 authorization request (no JAR).
	JARModeNone JARMode = "none"
	// JARModeRequestOnly sends the request object by value via the "request" parameter (RFC 9101 §5.1).
	JARModeRequestOnly JARMode = "requestOnly"
	// JARModeRequestURIOnly sends the request object by reference via the "request_uri" parameter (RFC 9101 §5.2).
	JARModeRequestURIOnly JARMode = "requestURIOnly"
	// JARModeBoth sends both "request" and "request_uri" simultaneously (useful for verifying AS error behaviour).
	JARModeBoth JARMode = "both"
)

type appConfig struct {
	issuerURL            string
	clientID             string
	clientSecret         string
	baseURL              string
	requestObjectBaseURL string
}

type clientProfile struct {
	name          string
	clientID      string
	clientSecret  string
	redirectURL   string
	jarMode       JARMode
	jarSigningKey JARSigningKey
	useJWKS       bool
}

type clientProfileDefinition struct {
	name          string
	jarMode       JARMode
	jarSigningKey JARSigningKey
	useJWKS       bool
}

const defaultClientProfile = "plain"

var clientProfileDefinitions = []clientProfileDefinition{
	{name: "plain", jarMode: JARModeNone, jarSigningKey: JARSigningKeyRSA},
	{name: "request-rs256-import", jarMode: JARModeRequestOnly, jarSigningKey: JARSigningKeyRSA},
	{name: "request-rs256-jwks", jarMode: JARModeRequestOnly, jarSigningKey: JARSigningKeyRSA, useJWKS: true},
	{name: "request-hs256", jarMode: JARModeRequestOnly, jarSigningKey: JARSigningKeyClientSecret},
	{name: "request-uri-rs256-import", jarMode: JARModeRequestURIOnly, jarSigningKey: JARSigningKeyRSA},
	{name: "request-uri-rs256-jwks", jarMode: JARModeRequestURIOnly, jarSigningKey: JARSigningKeyRSA, useJWKS: true},
	{name: "request-uri-hs256", jarMode: JARModeRequestURIOnly, jarSigningKey: JARSigningKeyClientSecret},
	{name: "both-rs256-import", jarMode: JARModeBoth, jarSigningKey: JARSigningKeyRSA},
}

func buildClientProfiles(config appConfig) map[string]clientProfile {
	profiles := make(map[string]clientProfile, len(clientProfileDefinitions))
	for _, definition := range clientProfileDefinitions {
		profiles[definition.name] = clientProfile{
			name:          definition.name,
			clientID:      config.clientID + "-" + definition.name,
			clientSecret:  config.clientSecret + "-" + definition.name,
			redirectURL:   strings.TrimRight(config.baseURL, "/") + "/callback/" + definition.name,
			jarMode:       definition.jarMode,
			jarSigningKey: definition.jarSigningKey,
			useJWKS:       definition.useJWKS,
		}
	}
	return profiles
}

func loadConfig() (appConfig, error) {
	realm := strings.TrimSpace(os.Getenv("KC_REALM"))
	if realm == "" {
		realm = "master"
	}
	issuerURL := strings.TrimSpace(os.Getenv("KC_ISSUER_URL"))
	if issuerURL == "" {
		issuerURL = fmt.Sprintf("http://localhost:8081/realms/%s", realm)
	}

	clientID := strings.TrimSpace(os.Getenv("KC_CLIENT_ID"))
	if clientID == "" {
		return appConfig{}, errors.New("KC_CLIENT_ID is required")
	}
	clientSecret := strings.TrimSpace(os.Getenv("KC_CLIENT_SECRET"))
	if clientSecret == "" {
		return appConfig{}, errors.New("KC_CLIENT_SECRET is required")
	}
	baseURL := strings.TrimSpace(os.Getenv("BASE_URL"))
	if baseURL == "" {
		baseURL = "http://localhost:8081"
	}

	// REQUEST_OBJECT_BASE_URL overrides the base URL used when building request_uri values.
	// Set this to a host reachable from the authorization server (e.g. http://host.docker.internal:8081
	// when Keycloak runs in Docker and the app runs on the host).
	// Falls back to BASE_URL when not set.
	requestObjectBaseURL := strings.TrimSpace(os.Getenv("REQUEST_OBJECT_BASE_URL"))
	if requestObjectBaseURL == "" {
		requestObjectBaseURL = baseURL
	}

	return appConfig{
		issuerURL:            issuerURL,
		clientID:             clientID,
		clientSecret:         clientSecret,
		baseURL:              baseURL,
		requestObjectBaseURL: requestObjectBaseURL,
	}, nil
}
