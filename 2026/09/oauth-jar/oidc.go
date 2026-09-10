package main

import (
	"crypto/rsa"
	_ "embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

//go:embed private.pem
var embeddedPrivateKey []byte

//go:embed public.pem
var embeddedPublicKey []byte

// clientKeyID is the key ID used in JAR JWT headers and in the client JWKS endpoint.
const clientKeyID = "client-key-hoge"

// ---------- Discovery ----------

type oidcDiscovery struct {
	Issuer                string `json:"issuer"`
	AuthorizationEndpoint string `json:"authorization_endpoint"`
	TokenEndpoint         string `json:"token_endpoint"`
	JWKSURI               string `json:"jwks_uri"`
}

func fetchDiscovery(issuerURL string) (*oidcDiscovery, error) {
	wellKnown := strings.TrimRight(issuerURL, "/") + "/.well-known/openid-configuration"
	resp, err := http.Get(wellKnown)
	if err != nil {
		return nil, fmt.Errorf("discovery request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("discovery returned status %d", resp.StatusCode)
	}
	var d oidcDiscovery
	if err := json.NewDecoder(resp.Body).Decode(&d); err != nil {
		return nil, fmt.Errorf("discovery decode failed: %w", err)
	}
	return &d, nil
}

// ---------- JWKS ----------

type jwks struct {
	Keys []jwk `json:"keys"`
}

type jwk struct {
	Kty string `json:"kty"`
	Use string `json:"use,omitempty"`
	Kid string `json:"kid,omitempty"`
	Alg string `json:"alg,omitempty"`
	N   string `json:"n"`
	E   string `json:"e"`
}

func fetchJWKS(jwksURI string) (*jwks, error) {
	resp, err := http.Get(jwksURI)
	if err != nil {
		return nil, fmt.Errorf("jwks request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("jwks returned status %d", resp.StatusCode)
	}
	var j jwks
	if err := json.NewDecoder(resp.Body).Decode(&j); err != nil {
		return nil, fmt.Errorf("jwks decode failed: %w", err)
	}
	return &j, nil
}

func (j *jwks) publicKey(kid string) (*rsa.PublicKey, error) {
	for _, k := range j.Keys {
		if k.Kid != kid || k.Kty != "RSA" {
			continue
		}
		nBytes, err := base64.RawURLEncoding.DecodeString(k.N)
		if err != nil {
			return nil, fmt.Errorf("jwk n decode: %w", err)
		}
		eBytes, err := base64.RawURLEncoding.DecodeString(k.E)
		if err != nil {
			return nil, fmt.Errorf("jwk e decode: %w", err)
		}
		return &rsa.PublicKey{
			N: new(big.Int).SetBytes(nBytes),
			E: int(new(big.Int).SetBytes(eBytes).Int64()),
		}, nil
	}
	return nil, fmt.Errorf("no RSA key found for kid %q", kid)
}

// ---------- Request Object Store ----------

// requestObjectEntry holds a one-time-use signed JWT and its expiry.
type requestObjectEntry struct {
	jwt       string
	expiresAt time.Time
}

// RequestObjectStore は署名済み Request Object JWT をインメモリで一時保管します。
// RFC 9101 §11.2.1 に従い、フェッチ後即削除（one-time use）で TTL 1分です。
type RequestObjectStore struct {
	m sync.Map
}

// Store saves the JWT and returns a random ID used to retrieve it.
func (s *RequestObjectStore) Store(jwtStr string) (string, error) {
	id, err := randomString(32)
	if err != nil {
		return "", fmt.Errorf("generate store id: %w", err)
	}
	s.m.Store(id, requestObjectEntry{
		jwt:       jwtStr,
		expiresAt: time.Now().Add(1 * time.Minute),
	})
	return id, nil
}

// Fetch retrieves and immediately deletes the JWT (one-time use).
// Returns false if the ID is unknown or has expired.
func (s *RequestObjectStore) Fetch(id string) (string, bool) {
	val, ok := s.m.LoadAndDelete(id)
	if !ok {
		return "", false
	}
	entry := val.(requestObjectEntry)
	if time.Now().After(entry.expiresAt) {
		return "", false
	}
	return entry.jwt, true
}

// ---------- Client JWKS ----------

// clientPublicJWK derives the RSA public key from the embedded private key
// and returns it in JWK format for the /jwks endpoint.
func clientPublicJWK() (*jwk, error) {
	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(embeddedPrivateKey)
	if err != nil {
		return nil, fmt.Errorf("parse private key: %w", err)
	}
	pub := &privateKey.PublicKey
	return &jwk{
		Kty: "RSA",
		Use: "sig",
		Kid: clientKeyID,
		Alg: "RS256",
		N:   base64.RawURLEncoding.EncodeToString(pub.N.Bytes()),
		E:   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(pub.E)).Bytes()),
	}, nil
}

// clientPublicJWKFromPEM parses the embedded public.pem and returns it in JWK format.
// Use this for the /jwks endpoint to avoid depending on the private key being present.
func clientPublicJWKFromPEM() (*jwk, error) {
	pub, err := jwt.ParseRSAPublicKeyFromPEM(embeddedPublicKey)
	if err != nil {
		return nil, fmt.Errorf("parse public key: %w", err)
	}
	return &jwk{
		Kty: "RSA",
		Use: "sig",
		Kid: clientKeyID,
		Alg: "RS256",
		N:   base64.RawURLEncoding.EncodeToString(pub.N.Bytes()),
		E:   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(pub.E)).Bytes()),
	}, nil
}

// ---------- Auth URL ----------

// buildAuthURL constructs the authorization endpoint URL.
// The jarMode parameter controls which JAR mechanism is used:
//   - JARModeNone:          plain OAuth2 request
//   - JARModeRequestOnly:   RFC 9101 §5.1 — request object by value ("request" param)
//   - JARModeRequestURIOnly: RFC 9101 §5.2 — request object by reference ("request_uri" param)
//   - JARModeBoth:          both "request" and "request_uri" sent simultaneously (for error-behaviour testing)
func buildAuthURL(authEndpoint, issuerURL, clientID, redirectURI, state, nonce, challenge string, jarMode JARMode, store *RequestObjectStore, baseURL, requestObjectBaseURL string, signingKey JARSigningKey, clientSecret string, useJWKS bool) (string, error) {
	switch jarMode {
	case JARModeRequestURIOnly:
		requestObject, err := buildRequestObject(issuerURL, clientID, redirectURI, state, nonce, challenge, signingKey, clientSecret, useJWKS)
		if err != nil {
			return "", fmt.Errorf("build request object: %w", err)
		}
		id, err := store.Store(requestObject)
		if err != nil {
			return "", fmt.Errorf("store request object: %w", err)
		}
		requestURI := fmt.Sprintf("%s/request-objects/%s", strings.TrimRight(requestObjectBaseURL, "/"), id)
		// RFC 9101 §5.2.2: request_uri と client_id のみを送る
		v := url.Values{}
		v.Add("client_id", clientID)
		v.Add("request_uri", requestURI)
		return authEndpoint + "?" + v.Encode(), nil

	case JARModeRequestOnly:
		requestObject, err := buildRequestObject(issuerURL, clientID, redirectURI, state, nonce, challenge, signingKey, clientSecret, useJWKS)
		if err != nil {
			return "", fmt.Errorf("build request object: %w", err)
		}
		// JAR (RFC 9101): client_id と request の両方を送る
		v := url.Values{}
		v.Add("client_id", clientID)
		v.Add("request", requestObject)
		return authEndpoint + "?" + v.Encode(), nil

	case JARModeBoth:
		requestObject, err := buildRequestObject(issuerURL, clientID, redirectURI, state, nonce, challenge, signingKey, clientSecret, useJWKS)
		if err != nil {
			return "", fmt.Errorf("build request object: %w", err)
		}
		id, err := store.Store(requestObject)
		if err != nil {
			return "", fmt.Errorf("store request object: %w", err)
		}
		requestURI := fmt.Sprintf("%s/request-objects/%s", strings.TrimRight(requestObjectBaseURL, "/"), id)
		// request と request_uri を同時送信 (AS のエラー動作を検証するため)
		v := url.Values{}
		v.Add("client_id", clientID)
		v.Add("request", requestObject)
		v.Add("request_uri", requestURI)
		return authEndpoint + "?" + v.Encode(), nil

	default: // JARModeNone
		v := url.Values{}
		v.Add("scope", "openid")
		v.Add("response_type", "code")
		v.Add("client_id", clientID)
		v.Add("redirect_uri", redirectURI)
		v.Add("state", state)
		v.Add("nonce", nonce)
		v.Add("code_challenge", challenge)
		v.Add("code_challenge_method", "S256")
		return authEndpoint + "?" + v.Encode(), nil
	}
}

// ---------- Token Exchange ----------

type tokenResponse struct {
	AccessToken  string `json:"access_token"`
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
}

func exchangeCode(tokenEndpoint, clientID, clientSecret, code, redirectURI, verifier string) (*tokenResponse, error) {
	v := url.Values{}
	v.Set("grant_type", "authorization_code")
	v.Set("code", code)
	v.Set("redirect_uri", redirectURI)
	v.Set("client_id", clientID)
	v.Set("client_secret", clientSecret)
	v.Set("code_verifier", verifier)

	resp, err := http.Post(tokenEndpoint, "application/x-www-form-urlencoded", strings.NewReader(v.Encode()))
	if err != nil {
		return nil, fmt.Errorf("token exchange request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token endpoint returned status %d", resp.StatusCode)
	}
	var tr tokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tr); err != nil {
		return nil, fmt.Errorf("token decode failed: %w", err)
	}
	return &tr, nil
}

// ---------- Custom Claim Types ----------

// RealmAccess represents Keycloak realm-level role information.
type RealmAccess struct {
	Roles []string `json:"roles,omitempty"`
}

// IDTokenClaims holds registered claims plus OIDC-specific fields for ID tokens.
type IDTokenClaims struct {
	jwt.RegisteredClaims
	Nonce             string `json:"nonce,omitempty"`
	Email             string `json:"email,omitempty"`
	EmailVerified     bool   `json:"email_verified,omitempty"`
	Name              string `json:"name,omitempty"`
	PreferredUsername string `json:"preferred_username,omitempty"`
	GivenName         string `json:"given_name,omitempty"`
	FamilyName        string `json:"family_name,omitempty"`
}

// AccessTokenClaims holds registered claims plus Keycloak access-token-specific fields.
type AccessTokenClaims struct {
	jwt.RegisteredClaims
	Type              string      `json:"typ,omitempty"`
	AuthorizedParty   string      `json:"azp,omitempty"`
	SessionState      string      `json:"session_state,omitempty"`
	ACR               string      `json:"acr,omitempty"`
	Scope             string      `json:"scope,omitempty"`
	SID               string      `json:"sid,omitempty"`
	Email             string      `json:"email,omitempty"`
	EmailVerified     bool        `json:"email_verified,omitempty"`
	Name              string      `json:"name,omitempty"`
	PreferredUsername string      `json:"preferred_username,omitempty"`
	GivenName         string      `json:"given_name,omitempty"`
	FamilyName        string      `json:"family_name,omitempty"`
	RealmAccess       RealmAccess `json:"realm_access,omitempty"`
}

// ---------- Token Verification ----------

// parseTokenClaims verifies the JWT signature and expiry using JWKS.
// Use this for access tokens where audience validation is not required.
func parseTokenClaims(rawToken string, j *jwks) (*AccessTokenClaims, error) {
	claims := &AccessTokenClaims{}
	token, err := jwt.ParseWithClaims(
		rawToken,
		claims,
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			kid, _ := token.Header["kid"].(string)
			return j.publicKey(kid)
		},
		jwt.WithExpirationRequired(),
	)
	if err != nil {
		return nil, fmt.Errorf("access token parse failed: %w", err)
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid access token")
	}
	return claims, nil
}

// verifyIDToken parses and verifies an id_token using the JWKS public key.
// nonce is checked only when non-empty (skipped on /home re-verification).
func verifyIDToken(idTokenRaw string, j *jwks, clientID, issuer, nonce string) (*IDTokenClaims, error) {
	claims := &IDTokenClaims{}
	token, err := jwt.ParseWithClaims(
		idTokenRaw,
		claims,
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			kid, _ := token.Header["kid"].(string)
			return j.publicKey(kid)
		},
		jwt.WithAudience(clientID),
		jwt.WithIssuer(issuer),
		jwt.WithExpirationRequired(),
	)
	if err != nil {
		return nil, fmt.Errorf("token parse failed: %w", err)
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	if nonce != "" && claims.Nonce != nonce {
		return nil, fmt.Errorf("nonce mismatch")
	}

	return claims, nil
}

// RequestObjectClaims represents the claims used in a JAR (JWT-Secured Authorization Request).
type RequestObjectClaims struct {
	jwt.RegisteredClaims
	ResponseType        string `json:"response_type"`
	ClientID            string `json:"client_id"`
	RedirectURI         string `json:"redirect_uri"`
	Scope               string `json:"scope"`
	State               string `json:"state"`
	Nonce               string `json:"nonce"`
	CodeChallenge       string `json:"code_challenge"`
	CodeChallengeMethod string `json:"code_challenge_method"`
}

func buildRequestObject(issuerURL, clientID, redirectURI, state, nonce, challenge string, signingKey JARSigningKey, clientSecret string, useJWKS bool) (string, error) {
	now := time.Now()
	claims := RequestObjectClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    clientID,
			Audience:  jwt.ClaimStrings{issuerURL},
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(5 * time.Minute)),
		},
		ResponseType:        "code",
		ClientID:            clientID,
		RedirectURI:         redirectURI,
		Scope:               "openid",
		State:               state,
		Nonce:               nonce,
		CodeChallenge:       challenge,
		CodeChallengeMethod: "S256",
	}

	if signingKey == JARSigningKeyClientSecret {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signed, err := token.SignedString([]byte(clientSecret))
		if err != nil {
			return "", fmt.Errorf("sign request object (HS256): %w", err)
		}
		return signed, nil
	}

	// Default: RS256 with embedded private key
	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(embeddedPrivateKey)
	if err != nil {
		return "", fmt.Errorf("parse private key: %w", err)
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	// NOTE: 秘密鍵で署名した場合、kid を付与すると Keycloak が内部のkeyを探すため、正しく検証できない
	// Keycloakのjwks_uriを使用するオプションにする場合に kid を付与する
	if useJWKS {
		token.Header["kid"] = clientKeyID
	}
	signed, err := token.SignedString(privateKey)
	if err != nil {
		return "", fmt.Errorf("sign request object (RS256): %w", err)
	}
	return signed, nil
}
