package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/sha256"
	_ "embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"net/url"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

//go:embed private.pem
var embeddedPrivateKey []byte

//go:embed public.pem
var embeddedPublicKey []byte

// clientKeyID identifies the public key exposed from the client's JWKS endpoint.
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

// ---------- Auth URL ----------

func buildAuthURL(authEndpoint, clientID, redirectURI, state, nonce, challenge string) string {
	v := url.Values{}
	v.Add("scope", "openid")
	v.Add("response_type", "code")
	v.Add("client_id", clientID)
	v.Add("redirect_uri", redirectURI)
	v.Add("state", state)
	v.Add("nonce", nonce)
	v.Add("code_challenge", challenge)
	v.Add("code_challenge_method", "S256")
	return authEndpoint + "?" + v.Encode()
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

// clientPublicJWKFromPEM parses the embedded public.pem and returns it in JWK format.
// Use this for the /jwks endpoint to avoid depending on the private key being present.
func clientPublicJWKFromPEM() (*jwk, error) {
	pub, err := jwt.ParseRSAPublicKeyFromPEM(embeddedPublicKey)
	if err != nil {
		return nil, fmt.Errorf("parse public key: %w", err)
	}
	return &jwk{
		Kty: "RSA",
		Use: "enc",
		Kid: clientKeyID,
		Alg: "RSA-OAEP",
		N:   base64.RawURLEncoding.EncodeToString(pub.N.Bytes()),
		E:   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(pub.E)).Bytes()),
	}, nil
}

type jweHeader struct {
	Alg string `json:"alg"`
	Enc string `json:"enc"`
	Kid string `json:"kid,omitempty"`
}

func normalizeIDToken(raw string) (string, error) {
	parts := strings.Split(raw, ".")
	switch len(parts) {
	case 3:
		return raw, nil
	case 5:
		return decryptCompactJWE(raw)
	default:
		return "", fmt.Errorf("unexpected token format: got %d parts", len(parts))
	}
}

func decryptCompactJWE(raw string) (string, error) {
	parts := strings.Split(raw, ".")
	if len(parts) != 5 {
		return "", fmt.Errorf("compact JWE must have 5 parts, got %d", len(parts))
	}

	protectedJSON, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", fmt.Errorf("decode protected header: %w", err)
	}

	var header jweHeader
	if err := json.Unmarshal(protectedJSON, &header); err != nil {
		return "", fmt.Errorf("parse protected header: %w", err)
	}

	cek, err := decryptContentEncryptionKey(header.Alg, parts[1])
	if err != nil {
		return "", err
	}

	iv, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return "", fmt.Errorf("decode iv: %w", err)
	}

	ciphertext, err := base64.RawURLEncoding.DecodeString(parts[3])
	if err != nil {
		return "", fmt.Errorf("decode ciphertext: %w", err)
	}

	tag, err := base64.RawURLEncoding.DecodeString(parts[4])
	if err != nil {
		return "", fmt.Errorf("decode authentication tag: %w", err)
	}

	switch header.Enc {
	case "A256GCM":
	default:
		return "", fmt.Errorf("unsupported JWE content encryption %q", header.Enc)
	}

	block, err := aes.NewCipher(cek)
	if err != nil {
		return "", fmt.Errorf("create AES cipher: %w", err)
	}

	aead, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("create AES-GCM: %w", err)
	}

	combined := make([]byte, 0, len(ciphertext)+len(tag))
	combined = append(combined, ciphertext...)
	combined = append(combined, tag...)

	plaintext, err := aead.Open(nil, iv, combined, []byte(parts[0]))
	if err != nil {
		return "", fmt.Errorf("decrypt JWE ciphertext: %w", err)
	}

	return string(plaintext), nil
}

func decryptContentEncryptionKey(alg, encodedKey string) ([]byte, error) {
	encryptedKey, err := base64.RawURLEncoding.DecodeString(encodedKey)
	if err != nil {
		return nil, fmt.Errorf("decode encrypted key: %w", err)
	}

	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(embeddedPrivateKey)
	if err != nil {
		return nil, fmt.Errorf("parse private key: %w", err)
	}

	switch alg {
	case "RSA-OAEP":
		cek, err := rsa.DecryptOAEP(sha1.New(), rand.Reader, privateKey, encryptedKey, nil)
		if err != nil {
			return nil, fmt.Errorf("decrypt CEK with RSA-OAEP: %w", err)
		}
		return cek, nil
	case "RSA-OAEP-256":
		cek, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, privateKey, encryptedKey, nil)
		if err != nil {
			return nil, fmt.Errorf("decrypt CEK with RSA-OAEP-256: %w", err)
		}
		return cek, nil
	default:
		return nil, fmt.Errorf("unsupported JWE key management algorithm %q", alg)
	}
}
