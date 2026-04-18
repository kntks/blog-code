package main

import (
	"errors"
	"fmt"
	"os"
	"strings"
)

type appConfig struct {
	issuerURL    string
	clientID     string
	clientSecret string
	redirectURL  string
}

func loadConfig() (appConfig, error) {
	realm := strings.TrimSpace(os.Getenv("KC_REALM"))
	if realm == "" {
		realm = "master"
	}
	issuerURL := strings.TrimSpace(os.Getenv("KC_ISSUER_URL"))
	if issuerURL == "" {
		issuerURL = fmt.Sprintf("http://localhost:8080/realms/%s", realm)
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

	redirectURL := strings.TrimSpace(os.Getenv("REDIRECT_URL"))
	if redirectURL == "" {
		redirectURL = fmt.Sprintf("%s/callback", strings.TrimRight(baseURL, "/"))
	}

	return appConfig{
		issuerURL:    issuerURL,
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURL:  redirectURL,
	}, nil
}
