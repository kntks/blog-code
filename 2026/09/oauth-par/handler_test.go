package main

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestPushAuthorizationRequestUsesBasicAuthAndAuthorizationParameters(t *testing.T) {
	var received url.Values
	parServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		username, password, ok := r.BasicAuth()
		if !ok || username != "myapp" || password != "test%2Bclient%2Fsecret" {
			t.Errorf("basic auth = (%q, %q, %t), want form-encoded OAuth credentials", username, password, ok)
		}
		if got := r.Header.Get("Content-Type"); got != "application/x-www-form-urlencoded" {
			t.Errorf("Content-Type = %q", got)
		}
		if err := r.ParseForm(); err != nil {
			t.Errorf("parse form: %v", err)
			http.Error(w, "invalid test request", http.StatusBadRequest)
			return
		}
		received = r.Form
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		fmt.Fprint(w, `{"request_uri":"urn:ietf:params:oauth:request_uri:abc","expires_in":300}`)
	}))
	defer parServer.Close()

	got, err := pushAuthorizationRequest(
		parServer.Client(),
		parServer.URL,
		"myapp",
		"test+client/secret",
		"http://localhost:8081/callback",
		"state-value",
		"nonce-value",
		"challenge-value",
	)
	if err != nil {
		t.Fatalf("push authorization request: %v", err)
	}
	if got.RequestURI != "urn:ietf:params:oauth:request_uri:abc" {
		t.Errorf("request_uri = %q", got.RequestURI)
	}
	if got.ExpiresIn != 300 {
		t.Errorf("expires_in = %d, want 300", got.ExpiresIn)
	}

	want := map[string]string{
		"response_type":         "code",
		"client_id":             "myapp",
		"redirect_uri":          "http://localhost:8081/callback",
		"scope":                 "openid",
		"state":                 "state-value",
		"nonce":                 "nonce-value",
		"code_challenge":        "challenge-value",
		"code_challenge_method": "S256",
	}
	if len(received) != len(want) {
		t.Fatalf("form keys = %v, want exactly %v", received, want)
	}
	for key, wantValue := range want {
		if gotValue := received.Get(key); gotValue != wantValue {
			t.Errorf("%s = %q, want %q", key, gotValue, wantValue)
		}
	}
}

func TestFetchDiscoveryRequiresPARSupportButNotServerWideEnforcement(t *testing.T) {
	discoveryServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{
			"issuer": %q,
			"authorization_endpoint": "https://issuer.example/authorize",
			"token_endpoint": "https://issuer.example/token",
			"jwks_uri": "https://issuer.example/jwks",
			"pushed_authorization_request_endpoint": "https://issuer.example/par",
			"require_pushed_authorization_requests": false
		}`, "issuer")
	}))
	defer discoveryServer.Close()

	discovery, err := fetchDiscovery(discoveryServer.URL)
	if err != nil {
		t.Fatalf("fetch discovery: %v", err)
	}
	if discovery.PushedAuthorizationRequestEndpoint != "https://issuer.example/par" {
		t.Errorf("PAR endpoint = %q", discovery.PushedAuthorizationRequestEndpoint)
	}
	if discovery.RequirePushedAuthorizationRequests {
		t.Error("server-wide PAR enforcement unexpectedly enabled")
	}
}

func TestFetchDiscoveryRejectsProviderWithoutPAREndpoint(t *testing.T) {
	discoveryServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"issuer":"issuer","authorization_endpoint":"https://issuer.example/authorize"}`)
	}))
	defer discoveryServer.Close()

	_, err := fetchDiscovery(discoveryServer.URL)
	if err == nil || !strings.Contains(err.Error(), "pushed_authorization_request_endpoint") {
		t.Fatalf("error = %v, want missing pushed_authorization_request_endpoint", err)
	}
}

func TestLoadConfigDefaultsIssuerToLocalKeycloak(t *testing.T) {
	t.Setenv("KC_REALM", "myrealm")
	t.Setenv("KC_ISSUER_URL", "")
	t.Setenv("KC_CLIENT_ID", "myapp")
	t.Setenv("KC_CLIENT_SECRET", "secret")
	t.Setenv("BASE_URL", "")

	config, err := loadConfig()
	if err != nil {
		t.Fatalf("load config: %v", err)
	}
	if config.issuerURL != "http://localhost:8080/realms/myrealm" {
		t.Errorf("issuer URL = %q", config.issuerURL)
	}
	if config.redirectURL() != "http://localhost:8081/callback" {
		t.Errorf("redirect URL = %q", config.redirectURL())
	}
}

func TestPushAuthorizationRequestReturnsStructuredOAuthError(t *testing.T) {
	parServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, `{"error":"invalid_request","error_description":"redirect_uri is invalid"}`)
	}))
	defer parServer.Close()

	_, err := pushAuthorizationRequest(parServer.Client(), parServer.URL, "myapp", "secret", "bad", "state", "nonce", "challenge")
	if err == nil {
		t.Fatal("error = nil, want PAR error")
	}
	var parErr *parRequestError
	if !errors.As(err, &parErr) {
		t.Fatalf("error type = %T, want *parRequestError", err)
	}
	if parErr.StatusCode != http.StatusBadRequest || parErr.OAuthError != "invalid_request" || parErr.Description != "redirect_uri is invalid" {
		t.Errorf("PAR error = %#v", parErr)
	}
}

func TestPushAuthorizationRequestRejectsIncompleteSuccessResponse(t *testing.T) {
	parServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		fmt.Fprint(w, `{"request_uri":"","expires_in":0}`)
	}))
	defer parServer.Close()

	_, err := pushAuthorizationRequest(parServer.Client(), parServer.URL, "myapp", "secret", "http://localhost/callback", "state", "nonce", "challenge")
	if err == nil || !strings.Contains(err.Error(), "invalid success response") {
		t.Fatalf("error = %v, want invalid success response", err)
	}
}

func TestHandleLoginPushesRequestAndRedirectsWithReferenceOnly(t *testing.T) {
	var pushed url.Values
	parServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			t.Errorf("parse form: %v", err)
			http.Error(w, "invalid test request", http.StatusBadRequest)
			return
		}
		pushed = r.Form
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		fmt.Fprint(w, `{"request_uri":"urn:ietf:params:oauth:request_uri:login","expires_in":300}`)
	}))
	defer parServer.Close()

	s := testServer()
	s.httpClient = parServer.Client()
	s.discovery.PushedAuthorizationRequestEndpoint = parServer.URL
	r := httptest.NewRequest(http.MethodGet, "/login", nil)
	w := httptest.NewRecorder()

	s.handleLogin(w, r)

	if w.Code != http.StatusFound {
		t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusFound, w.Body.String())
	}
	location, err := url.Parse(w.Header().Get("Location"))
	if err != nil {
		t.Fatalf("parse redirect location: %v", err)
	}
	if location.Scheme+"://"+location.Host+location.Path != s.discovery.AuthorizationEndpoint {
		t.Errorf("authorization endpoint = %q", location.String())
	}
	query := location.Query()
	if len(query) != 2 {
		t.Fatalf("authorization query = %v, want only client_id and request_uri", query)
	}
	if query.Get("client_id") != s.config.clientID {
		t.Errorf("client_id = %q", query.Get("client_id"))
	}
	if query.Get("request_uri") != "urn:ietf:params:oauth:request_uri:login" {
		t.Errorf("request_uri = %q", query.Get("request_uri"))
	}

	cookies := responseCookiesByName(w.Result().Cookies())
	for _, name := range []string{stateCookieName, nonceCookieName, pkceCookieName} {
		if cookies[name] == "" {
			t.Errorf("cookie %q was not set", name)
		}
	}
	if pushed.Get("state") != cookies[stateCookieName] {
		t.Errorf("pushed state does not match cookie")
	}
	if pushed.Get("nonce") != cookies[nonceCookieName] {
		t.Errorf("pushed nonce does not match cookie")
	}
	if pushed.Get("code_challenge") != pkceChallengeS256(cookies[pkceCookieName]) {
		t.Errorf("pushed code_challenge does not match verifier cookie")
	}
}

func TestHandleLoginReportsPARFailureWithoutLeakingSecret(t *testing.T) {
	parServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, `{"error":"invalid_request","error_description":"redirect_uri is invalid"}`)
	}))
	defer parServer.Close()

	s := testServer()
	s.httpClient = parServer.Client()
	s.discovery.PushedAuthorizationRequestEndpoint = parServer.URL
	w := httptest.NewRecorder()

	s.handleLogin(w, httptest.NewRequest(http.MethodGet, "/login", nil))

	if w.Code != http.StatusBadGateway {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadGateway)
	}
	body := w.Body.String()
	for _, want := range []string{"status 400", "invalid_request", "redirect_uri is invalid"} {
		if !strings.Contains(body, want) {
			t.Errorf("body %q does not contain %q", body, want)
		}
	}
	if strings.Contains(body, s.config.clientSecret) {
		t.Error("response leaked client secret")
	}
	if got := w.Header().Get("Location"); got != "" {
		t.Errorf("unexpected fallback redirect %q", got)
	}
}

func TestHandleIndexShowsSinglePARLogin(t *testing.T) {
	s := testServer()
	w := httptest.NewRecorder()

	s.handleIndex(w, httptest.NewRequest(http.MethodGet, "/", nil))

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusOK, w.Body.String())
	}
	body := w.Body.String()
	if strings.Count(body, `class="login-link"`) != 1 || !strings.Contains(body, `href="/login"`) {
		t.Errorf("index does not contain exactly one /login link: %s", body)
	}
	if !strings.Contains(body, "OAuth PAR") {
		t.Errorf("index does not identify PAR: %s", body)
	}
}

func TestHandleCallbackUsesConfiguredClient(t *testing.T) {
	s := testServer()
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("generate RSA key: %v", err)
	}
	s.jwks = jwksForPublicKey(&privateKey.PublicKey, "test-key")

	nonce := "test-nonce"
	now := time.Now()
	idTokenToken := jwt.NewWithClaims(jwt.SigningMethodRS256, IDTokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.discovery.Issuer,
			Subject:   "user-1",
			Audience:  jwt.ClaimStrings{s.config.clientID},
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Minute)),
		},
		Nonce: nonce,
	})
	idTokenToken.Header["kid"] = "test-key"
	idToken, err := idTokenToken.SignedString(privateKey)
	if err != nil {
		t.Fatalf("sign test ID token: %v", err)
	}

	var received url.Values
	tokenServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			t.Errorf("parse token request: %v", err)
			http.Error(w, "invalid test request", http.StatusBadRequest)
			return
		}
		received = r.Form
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(tokenResponse{AccessToken: "access-token", IDToken: idToken})
	}))
	defer tokenServer.Close()
	s.discovery.TokenEndpoint = tokenServer.URL

	r := httptest.NewRequest(http.MethodGet, "/callback?code=test-code&state=test-state", nil)
	r.AddCookie(&http.Cookie{Name: stateCookieName, Value: "test-state"})
	r.AddCookie(&http.Cookie{Name: nonceCookieName, Value: nonce})
	r.AddCookie(&http.Cookie{Name: pkceCookieName, Value: "test-verifier"})
	w := httptest.NewRecorder()

	s.handleCallback(w, r)

	if w.Code != http.StatusFound {
		t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusFound, w.Body.String())
	}
	want := map[string]string{
		"client_id":     s.config.clientID,
		"client_secret": s.config.clientSecret,
		"redirect_uri":  s.config.redirectURL(),
		"code_verifier": "test-verifier",
	}
	for key, wantValue := range want {
		if got := received.Get(key); got != wantValue {
			t.Errorf("token %s = %q, want %q", key, got, wantValue)
		}
	}
}

func responseCookiesByName(cookies []*http.Cookie) map[string]string {
	values := make(map[string]string, len(cookies))
	for _, cookie := range cookies {
		values[cookie.Name] = cookie.Value
	}
	return values
}

func jwksForPublicKey(publicKey *rsa.PublicKey, kid string) *jwks {
	return &jwks{Keys: []jwk{{
		Kty: "RSA",
		Use: "sig",
		Kid: kid,
		Alg: "RS256",
		N:   base64.RawURLEncoding.EncodeToString(publicKey.N.Bytes()),
		E:   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(publicKey.E)).Bytes()),
	}}}
}

func testServer() *server {
	return &server{
		config: appConfig{
			issuerURL:    "http://localhost:8080/realms/myrealm",
			clientID:     "myapp",
			clientSecret: "test-client-secret",
			baseURL:      "http://localhost:8081",
		},
		discovery: &oidcDiscovery{
			AuthorizationEndpoint:              "https://issuer.example/authorize",
			TokenEndpoint:                      "https://issuer.example/token",
			PushedAuthorizationRequestEndpoint: "https://issuer.example/par",
			Issuer:                             "http://localhost:8080/realms/myrealm",
		},
		httpClient: http.DefaultClient,
	}
}
