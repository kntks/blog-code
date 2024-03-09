package main

import (
	"bytes"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

const (
	keycloakRealm = "myrealm"
	keycloakURL   = "http://localhost:8080/realms/" + keycloakRealm
	clientID      = "myapp"
	clientSecret  = ""
)

func main() {
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/callback", handleCallback)
	http.HandleFunc("/home", handleHome)

	fmt.Println("Server is running on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}

// ブラウザでhttp://localhost:8081/loginにアクセスすると Keycloakのログイン画面にリダイレクトする
func handleLogin(w http.ResponseWriter, r *http.Request) {
	v := url.Values{}
	v.Add("scope", "openid")
	v.Add("response_type", "code")
	v.Add("client_id", clientID)
	v.Add("redirect_uri", "http://localhost:8081/callback")

	redirectURL, err := url.ParseRequestURI(fmt.Sprintf("%s/protocol/openid-connect/auth", keycloakURL))
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	redirectURL.RawQuery = v.Encode()

	http.Redirect(w, r, redirectURL.String(), http.StatusSeeOther)
}

type IDTokenClames struct {
	AuthorizedParty string `json:"azp,omitempty"`
	AccessTokenHash string `json:"at_hash,omitempty"`
	jwt.RegisteredClaims
}

func (i *IDTokenClames) Validate() error {
	if i.AuthorizedParty != clientID {
		return errors.New("azp does not match the client ID")
	}
	return nil
}

type AccessTokenClaims struct {
	AuthorizedParty string `json:"azp,omitempty"`
	jwt.RegisteredClaims
}

func (a *AccessTokenClaims) Validate() error {
	if a.AuthorizedParty != clientID {
		return errors.New("azp does not match the client ID")
	}
	return nil
}

type RSA struct {
	Kid     string   `json:"kid"`
	Kty     string   `json:"kty"`
	Alg     string   `json:"alg"`
	Use     string   `json:"use"`
	N       string   `json:"n"`
	E       string   `json:"e"`
	X5C     []string `json:"x5c"`
	X5T     string   `json:"x5t"`
	X5TS256 string   `json:"x5t#S256"`
}

type JWK = RSA

// https://openid-foundation-japan.github.io/rfc7517.ja.html
type JWKSet struct {
	Keys []JWK `json:"keys"`
}

// func (j *JWKSet) toVerificationKey() jwt.VerificationKeySet {
// 	return jwt.VerificationKeySet{Keys: j.Keys}
// }

func getJWKSet() (*JWKSet, error) {
	certUrl := fmt.Sprintf("%s/protocol/openid-connect/certs", keycloakURL)
	res, err := http.DefaultClient.Get(certUrl)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var jwks JWKSet
	if err := json.NewDecoder(res.Body).Decode(&jwks); err != nil {
		return nil, err
	}

	keys := make([]JWK, 0, len(jwks.Keys))
	for _, key := range jwks.Keys {
		if key.Alg == "RS256" && key.Use == "sig" && len(key.X5C) == 1 {
			keys = append(keys, key)
		}
	}

	if len(keys) == 0 {
		return nil, fmt.Errorf("alg=rs256 json web key is not found")
	}

	return &JWKSet{Keys: keys}, nil
}

func getPublicKey(x5c string) (*rsa.PublicKey, error) {
	dec, err := base64.StdEncoding.DecodeString(x5c)
	if err != nil {
		return nil, err
	}

	cert, err := x509.ParseCertificate(dec)
	if err != nil {
		return nil, err
	}

	publicKey, ok := cert.PublicKey.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("rsa public key %v", publicKey)
	}

	return publicKey, nil
}

func (j *JWKSet) ToVerificationKeySet() jwt.VerificationKeySet {
	keys := make([]jwt.VerificationKey, 0, len(j.Keys))

	for _, k := range j.Keys {
		if k.X5C == nil || len(k.X5C) == 0 {
			continue
		}

		pubKey, err := getPublicKey(k.X5C[0])
		if err != nil {
			log.Println(err)
			continue
		}
		keys = append(keys, pubKey)
	}

	return jwt.VerificationKeySet{Keys: keys}
}

// Keycloak で認証後、リダイレクトされ、この関数が呼ばれる
func handleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")

	tokenURL := fmt.Sprintf("%s/protocol/openid-connect/token", keycloakURL)

	v := url.Values{}
	v.Add("grant_type", "authorization_code")
	v.Add("code", code)
	v.Add("client_id", clientID)
	v.Add("client_secret", clientSecret)
	v.Add("redirect_uri", "http://localhost:8081/callback")

	payload := strings.NewReader(v.Encode())
	req, _ := http.NewRequest("POST", tokenURL, payload)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	// v.Add("client_secret", clientSecret) ではなく、Basic認証でもOK
	// req.SetBasicAuth(clientID, clientSecret)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer res.Body.Close()

	var tmp, out bytes.Buffer
	teeReader := io.TeeReader(res.Body, &tmp)

	// レスポンスからアクセストークンを取得
	var tokenResponse struct {
		IDToken     string `json:"id_token"`
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(teeReader).Decode(&tokenResponse); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if tokenResponse.AccessToken == "" {
		http.Error(w, "token is empty", http.StatusInternalServerError)
		return
	}

	// responseをterminalに出力する用
	{
		if err := json.Indent(&out, tmp.Bytes(), "", " "); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Println(out.String())
	}

	// KeycloakからCertificateを取得する
	jwkset, err := getJWKSet()
	if err != nil {
		log.Println(err)
		http.Error(w, "InternalServerError", http.StatusInternalServerError)
		return
	}

	// JWKSからjwt.VerificationKeySetに変換する
	verificationKeySet := jwkset.ToVerificationKeySet()

	// IDトークンを検証する
	var idTokenClames IDTokenClames
	token, err := jwt.ParseWithClaims(
		tokenResponse.IDToken,
		&idTokenClames,
		func(token *jwt.Token) (interface{}, error) {
			return verificationKeySet, nil
		},
		jwt.WithExpirationRequired(),
		jwt.WithValidMethods([]string{"RS256"}),
		jwt.WithIssuer(keycloakURL),
		jwt.WithAudience(clientID),
	)
	if err != nil {
		log.Println(err)
		http.Error(w, "InternalServerError", http.StatusInternalServerError)
		return
	}

	if !token.Valid {
		log.Println("token invalid")
		http.Error(w, "InternalServerError", http.StatusInternalServerError)
		return
	}

	// アクセストークンを検証する
	if c, ok := token.Claims.(IDTokenClames); ok {
		accessTokenHash := sha256.Sum256([]byte(tokenResponse.AccessToken))
		leftmostHash := base64.RawURLEncoding.EncodeToString(accessTokenHash[:16])
		if c.AccessTokenHash != leftmostHash {
			log.Println("access token is not equal to the at_hash")
			http.Error(w, "InternalServerError", http.StatusInternalServerError)
			return
		}
	}

	// アクセストークンをCookieに保存
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    tokenResponse.AccessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})

	// ログイン完了後のリダイレクト
	http.Redirect(w, r, "/home", http.StatusSeeOther)
}

func handleHome(w http.ResponseWriter, r *http.Request) {
	// Cookieからアクセストークンを取得
	// tokenが存在しない場合は、401 Unauthorizedで返す
	cookie, err := r.Cookie("access_token")
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// keycloakからcertificateを取得する
	jwkset, err := getJWKSet()
	if err != nil {
		log.Println(err)
		http.Error(w, "InternalServerError", http.StatusInternalServerError)
		return
	}

	// JWKSからjwt.VerificationKeySetに変換する
	verificationKeySet := jwkset.ToVerificationKeySet()

	var accessTokenClames AccessTokenClaims
	token, err := jwt.ParseWithClaims(
		cookie.Value,
		&accessTokenClames,
		func(token *jwt.Token) (interface{}, error) {
			return verificationKeySet, nil
		},
		jwt.WithExpirationRequired(),
		jwt.WithValidMethods([]string{"RS256"}),
		jwt.WithIssuer(keycloakURL),
		jwt.WithAudience("account"),
	)

	if err != nil {
		log.Println(err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// アクセストークンを検証
	if !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 認証が成功した場合の処理
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Welcome !!!")
}
