package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

func (s *server) handleIndex(w http.ResponseWriter, r *http.Request) {
	links := make([]loginLink, 0, len(clientProfileDefinitions))
	for _, definition := range clientProfileDefinitions {
		links = append(links, loginLink{
			Name: definition.name,
			URL:  "/login/" + definition.name,
		})
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := indexTmpl.Execute(w, links); err != nil {
		log.Printf("index template execute error: %v", err)
	}
}

func (s *server) handleLogin(w http.ResponseWriter, r *http.Request) {
	profileName := r.PathValue("profile")
	if profileName == "" {
		profileName = defaultClientProfile
	}
	profile, ok := s.clientProfile(profileName)
	if !ok {
		http.Error(w, "unknown client profile", http.StatusNotFound)
		return
	}

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
	setCookie(w, profileCookieName, profile.name, time.Hour)

	authURL, err := buildAuthURL(
		s.discovery.AuthorizationEndpoint,
		s.discovery.Issuer,
		profile.clientID,
		profile.redirectURL,
		state,
		nonce,
		challenge,
		profile.jarMode,
		s.roStore,
		s.config.baseURL,
		s.config.requestObjectBaseURL,
		profile.jarSigningKey,
		profile.clientSecret,
		profile.useJWKS,
	)
	if err != nil {
		log.Printf("build auth URL error: %v", err)
		http.Error(w, "failed to build auth URL", http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, authURL, http.StatusFound)
}

func (s *server) handleCallback(w http.ResponseWriter, r *http.Request) {
	profileName := r.PathValue("profile")
	if profileName == "" {
		profileName, _ = readCookie(r, profileCookieName)
		if profileName == "" {
			profileName = defaultClientProfile
		}
	}
	profile, ok := s.clientProfile(profileName)
	if !ok {
		http.Error(w, "unknown client profile", http.StatusNotFound)
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
		profile.clientID,
		profile.clientSecret,
		code,
		profile.redirectURL,
		verifier,
	)
	if err != nil {
		log.Printf("token exchange error: %v", err)
		http.Error(w, "failed to exchange token", http.StatusBadRequest)
		return
	}

	if _, err := verifyIDToken(tr.IDToken, s.jwks, profile.clientID, s.discovery.Issuer, nonce); err != nil {
		log.Printf("id_token verification error: %v", err)
		http.Error(w, "invalid id_token", http.StatusBadRequest)
		return
	}

	setCookie(w, idTokenCookie, tr.IDToken, time.Hour)
	setCookie(w, accessTokenCookie, tr.AccessToken, time.Hour)
	setCookie(w, profileCookieName, profile.name, time.Hour)
	clearCookie(w, stateCookieName)
	clearCookie(w, nonceCookieName)
	clearCookie(w, pkceCookieName)
	http.Redirect(w, r, "/home", http.StatusFound)
}

func (s *server) handleHome(w http.ResponseWriter, r *http.Request) {
	profileName, err := readCookie(r, profileCookieName)
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}
	profile, ok := s.clientProfile(profileName)
	if !ok {
		clearCookie(w, profileCookieName)
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}

	idToken, err := readCookie(r, idTokenCookie)
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}
	// nonce は /callback で検証済みのためスキップ
	idClaims, err := verifyIDToken(idToken, s.jwks, profile.clientID, s.discovery.Issuer, "")
	if err != nil {
		clearCookie(w, idTokenCookie)
		clearCookie(w, accessTokenCookie)
		clearCookie(w, profileCookieName)
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

func (s *server) clientProfile(name string) (clientProfile, bool) {
	profiles := s.profiles
	if profiles == nil {
		profiles = buildClientProfiles(s.config)
	}
	profile, ok := profiles[name]
	return profile, ok
}

func (s *server) validateState(r *http.Request, state string) bool {
	stored, err := readCookie(r, stateCookieName)
	if err != nil {
		return false
	}
	return stored == state
}

// handleClientJWKS serves the client's public key as a JWK Set (RFC 7517 §5).
// Keycloak uses this endpoint (configured as jwks_uri) to verify RS256-signed
// JAR request objects sent by this client.
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

// RFC 9101 Section 5.2.3: Keycloak が GET で取りに来る。
// one-time use：取得後即座に削除される。
func (s *server) handleRequestObject(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}
	log.Printf("request object fetched by AS: method=%s url=%s id=%s remote=%s", r.Method, r.URL, id, r.RemoteAddr)

	jwtStr, ok := s.roStore.Fetch(id)
	if !ok {
		log.Printf("request object not found or expired: id=%s", id)
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/oauth-authz-req+jwt")
	w.Header().Set("Cache-Control", "no-store")
	fmt.Fprint(w, jwtStr)
}
