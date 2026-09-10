package main

import (
	"log"
	"net/http"
)

const (
	stateCookieName   = "oauth_state"
	nonceCookieName   = "oauth_nonce"
	pkceCookieName    = "pkce_verifier"
	profileCookieName = "oauth_profile"
	idTokenCookie     = "id_token"
	accessTokenCookie = "access_token"
)

type server struct {
	config    appConfig
	profiles  map[string]clientProfile
	discovery *oidcDiscovery
	jwks      *jwks
	roStore   *RequestObjectStore
}

func main() {
	config, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}

	discovery, err := fetchDiscovery(config.issuerURL)
	if err != nil {
		log.Fatalf("OIDC discovery failed: %v", err)
	}
	log.Printf("discovered issuer: %s", discovery.Issuer)

	keys, err := fetchJWKS(discovery.JWKSURI)
	if err != nil {
		log.Fatalf("JWKS fetch failed: %v", err)
	}

	app := &server{
		config:    config,
		profiles:  buildClientProfiles(config),
		discovery: discovery,
		jwks:      keys,
		roStore:   &RequestObjectStore{},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", app.handleIndex)
	mux.HandleFunc("GET /login", app.handleLogin)
	mux.HandleFunc("GET /login/{profile}", app.handleLogin)
	mux.HandleFunc("GET /callback", app.handleCallback)
	mux.HandleFunc("GET /callback/{profile}", app.handleCallback)
	mux.HandleFunc("GET /home", app.handleHome)
	mux.HandleFunc("GET /request-objects/{id}", app.handleRequestObject)
	mux.HandleFunc("GET /jwks", app.handleClientJWKS)

	address := ":8081"
	log.Printf("listening on %s", address)
	if err := http.ListenAndServe(address, mux); err != nil {
		log.Fatal(err)
	}
}
