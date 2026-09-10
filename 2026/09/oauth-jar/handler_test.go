package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestHandleLoginUsesSelectedClientProfile(t *testing.T) {
	tests := []struct {
		name           string
		profile        string
		wantClientID   string
		wantAlgorithm  string
		wantRequest    bool
		wantRequestURI bool
		wantKID        bool
	}{
		{
			name:          "plain",
			profile:       "plain",
			wantClientID:  "myapp-plain",
			wantAlgorithm: "",
		},
		{
			name:          "request by value with imported RSA key",
			profile:       "request-rs256-import",
			wantClientID:  "myapp-request-rs256-import",
			wantAlgorithm: "RS256",
			wantRequest:   true,
		},
		{
			name:          "request by value with JWKS",
			profile:       "request-rs256-jwks",
			wantClientID:  "myapp-request-rs256-jwks",
			wantAlgorithm: "RS256",
			wantRequest:   true,
			wantKID:       true,
		},
		{
			name:          "request by value with client secret",
			profile:       "request-hs256",
			wantClientID:  "myapp-request-hs256",
			wantAlgorithm: "HS256",
			wantRequest:   true,
		},
		{
			name:           "both request parameters for negative testing",
			profile:        "both-rs256-import",
			wantClientID:   "myapp-both-rs256-import",
			wantAlgorithm:  "RS256",
			wantRequest:    true,
			wantRequestURI: true,
		},
		{
			name:           "request by reference with imported RSA key",
			profile:        "request-uri-rs256-import",
			wantClientID:   "myapp-request-uri-rs256-import",
			wantAlgorithm:  "RS256",
			wantRequestURI: true,
		},
		{
			name:           "request by reference with client secret",
			profile:        "request-uri-hs256",
			wantClientID:   "myapp-request-uri-hs256",
			wantAlgorithm:  "HS256",
			wantRequestURI: true,
		},
		{
			name:           "request by reference with JWKS",
			profile:        "request-uri-rs256-jwks",
			wantClientID:   "myapp-request-uri-rs256-jwks",
			wantAlgorithm:  "RS256",
			wantRequestURI: true,
			wantKID:        true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := testServer()
			r := httptest.NewRequest(http.MethodGet, "/login/"+tt.profile, nil)
			r.SetPathValue("profile", tt.profile)
			w := httptest.NewRecorder()

			s.handleLogin(w, r)

			if w.Code != http.StatusFound {
				t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusFound, w.Body.String())
			}
			location, err := url.Parse(w.Header().Get("Location"))
			if err != nil {
				t.Fatalf("parse redirect location: %v", err)
			}
			if got := location.Query().Get("client_id"); got != tt.wantClientID {
				t.Errorf("client_id = %q, want %q", got, tt.wantClientID)
			}

			requestObject := location.Query().Get("request")
			if (requestObject != "") != tt.wantRequest {
				t.Errorf("request present = %t, want %t", requestObject != "", tt.wantRequest)
			}
			requestURI := location.Query().Get("request_uri")
			if (requestURI != "") != tt.wantRequestURI {
				t.Errorf("request_uri present = %t, want %t", requestURI != "", tt.wantRequestURI)
			}

			if tt.wantAlgorithm != "" {
				if requestObject == "" {
					requestObject = requestObjectFromURI(t, s, requestURI)
				}
				token, _, err := jwt.NewParser().ParseUnverified(requestObject, jwt.MapClaims{})
				if err != nil {
					t.Fatalf("parse request object: %v", err)
				}
				if got := token.Method.Alg(); got != tt.wantAlgorithm {
					t.Errorf("request object alg = %q, want %q", got, tt.wantAlgorithm)
				}
				_, hasKID := token.Header["kid"]
				if hasKID != tt.wantKID {
					t.Errorf("request object has kid = %t, want %t", hasKID, tt.wantKID)
				}
			}
		})
	}
}

func TestHandleIndexListsAllLoginProfilesCentered(t *testing.T) {
	s := testServer()
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	s.handleIndex(w, r)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusOK, w.Body.String())
	}
	body := w.Body.String()
	if got, want := strings.Count(body, `class="login-link"`), len(clientProfileDefinitions); got != want {
		t.Fatalf("login link count = %d, want %d", got, want)
	}
	if !strings.Contains(body, "justify-content: center") {
		t.Error("index page is not centered")
	}
	for _, definition := range clientProfileDefinitions {
		wantHref := `href="/login/` + definition.name + `"`
		if !strings.Contains(body, wantHref) {
			t.Errorf("index page does not contain %s", wantHref)
		}
	}
}

func requestObjectFromURI(t *testing.T, s *server, requestURI string) string {
	t.Helper()
	parsed, err := url.Parse(requestURI)
	if err != nil {
		t.Fatalf("parse request_uri: %v", err)
	}
	request := httptest.NewRequest(http.MethodGet, parsed.Path, nil)
	request.SetPathValue("id", parsed.Path[strings.LastIndex(parsed.Path, "/")+1:])
	response := httptest.NewRecorder()
	s.handleRequestObject(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("request object status = %d, want %d", response.Code, http.StatusOK)
	}
	return response.Body.String()
}

func TestHandleLoginRejectsUnknownClientProfile(t *testing.T) {
	s := testServer()
	r := httptest.NewRequest(http.MethodGet, "/login/unknown", nil)
	r.SetPathValue("profile", "unknown")
	w := httptest.NewRecorder()

	s.handleLogin(w, r)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestBuildClientProfilesDefinesEightVerificationProfiles(t *testing.T) {
	profiles := buildClientProfiles(testServer().config)
	if got, want := len(profiles), 8; got != want {
		t.Fatalf("profile count = %d, want %d", got, want)
	}

	seenClientIDs := make(map[string]struct{}, len(profiles))
	seenClientSecrets := make(map[string]struct{}, len(profiles))
	seenRedirectURLs := make(map[string]struct{}, len(profiles))
	for name, profile := range profiles {
		if profile.name != name {
			t.Errorf("profile name = %q for key %q", profile.name, name)
		}
		if _, exists := seenClientIDs[profile.clientID]; exists {
			t.Errorf("duplicate client ID %q", profile.clientID)
		}
		seenClientIDs[profile.clientID] = struct{}{}
		if _, exists := seenClientSecrets[profile.clientSecret]; exists {
			t.Errorf("duplicate client secret for profile %q", name)
		}
		seenClientSecrets[profile.clientSecret] = struct{}{}
		if _, exists := seenRedirectURLs[profile.redirectURL]; exists {
			t.Errorf("duplicate redirect URL %q", profile.redirectURL)
		}
		seenRedirectURLs[profile.redirectURL] = struct{}{}
	}
}

func TestHandleCallbackUsesSelectedClientProfile(t *testing.T) {
	s := testServer()
	profile, ok := s.clientProfile("request-hs256")
	if !ok {
		t.Fatal("request-hs256 profile not found")
	}

	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(embeddedPrivateKey)
	if err != nil {
		t.Fatalf("parse test private key: %v", err)
	}
	nonce := "test-nonce"
	now := time.Now()
	idTokenToken := jwt.NewWithClaims(jwt.SigningMethodRS256, IDTokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.discovery.Issuer,
			Subject:   "user-1",
			Audience:  jwt.ClaimStrings{profile.clientID},
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Minute)),
		},
		Nonce: nonce,
	})
	idTokenToken.Header["kid"] = clientKeyID
	idToken, err := idTokenToken.SignedString(privateKey)
	if err != nil {
		t.Fatalf("sign test ID token: %v", err)
	}

	key, err := clientPublicJWKFromPEM()
	if err != nil {
		t.Fatalf("build test JWKS: %v", err)
	}
	s.jwks = &jwks{Keys: []jwk{*key}}

	var received url.Values
	originalTransport := http.DefaultTransport
	http.DefaultTransport = roundTripperFunc(func(r *http.Request) (*http.Response, error) {
		if err := r.ParseForm(); err != nil {
			t.Errorf("parse token request: %v", err)
		}
		received = r.Form
		body, _ := json.Marshal(tokenResponse{
			AccessToken: "access-token",
			IDToken:     idToken,
		})
		return &http.Response{
			StatusCode: http.StatusOK,
			Header:     http.Header{"Content-Type": []string{"application/json"}},
			Body:       io.NopCloser(bytes.NewReader(body)),
			Request:    r,
		}, nil
	})
	defer func() { http.DefaultTransport = originalTransport }()
	s.discovery.TokenEndpoint = "http://token.test/token"

	r := httptest.NewRequest(http.MethodGet, "/callback/request-hs256?code=test-code&state=test-state", nil)
	r.SetPathValue("profile", "request-hs256")
	r.AddCookie(&http.Cookie{Name: stateCookieName, Value: "test-state"})
	r.AddCookie(&http.Cookie{Name: nonceCookieName, Value: nonce})
	r.AddCookie(&http.Cookie{Name: pkceCookieName, Value: "test-verifier"})
	w := httptest.NewRecorder()

	s.handleCallback(w, r)

	if w.Code != http.StatusFound {
		t.Fatalf("status = %d, want %d; body = %s", w.Code, http.StatusFound, w.Body.String())
	}
	if got := received.Get("client_id"); got != profile.clientID {
		t.Errorf("token client_id = %q, want %q", got, profile.clientID)
	}
	if got := received.Get("client_secret"); got != profile.clientSecret {
		t.Errorf("token client_secret = %q, want %q", got, profile.clientSecret)
	}
	if got := received.Get("redirect_uri"); got != profile.redirectURL {
		t.Errorf("token redirect_uri = %q, want %q", got, profile.redirectURL)
	}
}

type roundTripperFunc func(*http.Request) (*http.Response, error)

func (f roundTripperFunc) RoundTrip(r *http.Request) (*http.Response, error) {
	return f(r)
}

func testServer() *server {
	return &server{
		config: appConfig{
			issuerURL:            "http://localhost:8080/realms/myrealm",
			clientID:             "myapp",
			clientSecret:         "test-client-secret",
			baseURL:              "http://localhost:8081",
			requestObjectBaseURL: "http://host.docker.internal:8081",
		},
		discovery: &oidcDiscovery{
			AuthorizationEndpoint: "http://localhost:8080/realms/myrealm/protocol/openid-connect/auth",
			Issuer:                "http://localhost:8080/realms/myrealm",
		},
		roStore: &RequestObjectStore{},
	}
}
