package main

import (
	"bytes"
	"crypto/rand"
	"crypto/sha256"
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
	redirectURI   = "https://localhost:8443/callback"
)

func main() {
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/callback", handleCallback)
	http.HandleFunc("/home", handleHome)

	fmt.Println("Server is running on :8443")
	log.Fatal(http.ListenAndServeTLS(":8443", "cert.pem", "key.pem", nil))
}

func generateRandomString(nByte int) (string, error) {
	b := make([]byte, nByte)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func generateCodeChallenge(codeVerifier string) string {
	hash := sha256.Sum256([]byte(codeVerifier))
	return base64.RawURLEncoding.EncodeToString(hash[:])
}

// ブラウザでhttp://localhost:8081/loginにアクセスすると Keycloakのログイン画面にリダイレクトする
func handleLogin(w http.ResponseWriter, r *http.Request) {

	state, err := generateRandomString(128)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	nonce, err := generateRandomString(128)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	codeVerifier, err := generateRandomString(64)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	v := url.Values{}
	v.Add("scope", "openid")
	v.Add("response_type", "code")
	v.Add("client_id", clientID)
	v.Add("redirect_uri", redirectURI)
	v.Add("state", state)
	v.Add("nonce", nonce)
	v.Add("code_challenge", generateCodeChallenge(codeVerifier))
	v.Add("code_challenge_method", "S256")

	http.SetCookie(w, &http.Cookie{
		Name:     "state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "nonce",
		Value:    nonce,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "verifier",
		Value:    codeVerifier,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "redirect_uri",
		Value:    redirectURI,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	redirectURL, err := url.ParseRequestURI(fmt.Sprintf("%s/protocol/openid-connect/auth", keycloakURL))
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	redirectURL.RawQuery = v.Encode()

	http.Redirect(w, r, redirectURL.String(), http.StatusSeeOther)
}

// Keycloak で認証後、リダイレクトされ、この関数が呼ばれる
func handleCallback(w http.ResponseWriter, r *http.Request) {

	// リダイレクトURIの検証
	{
		r, err := r.Cookie("redirect_uri")
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if r.Value != redirectURI {
			log.Println("redirect_uri is not equal")
			http.Error(w, "redirect_uri is not equal", http.StatusBadRequest)
			return
		}
	}
	// Cookieからstateを取得
	state, err := r.Cookie("state")
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// stateの検証
	if state.Value != r.URL.Query().Get("state") {
		log.Printf("cookie state: %s、callback url state: %s\n", state, r.URL.Query().Get("state"))
		http.Error(w, "state is not equal", http.StatusBadRequest)
		return
	}

	nonce, err := r.Cookie("nonce")
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Cookieからcode_verifierを取得
	codeVerifier, err := r.Cookie("verifier")
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	code := r.URL.Query().Get("code")

	tokenURL := fmt.Sprintf("%s/protocol/openid-connect/token", keycloakURL)

	v := url.Values{}
	v.Add("grant_type", "authorization_code")
	v.Add("code", code)
	v.Add("client_id", clientID)
	v.Add("client_secret", clientSecret)
	v.Add("redirect_uri", redirectURI)
	v.Add("code_verifier", codeVerifier.Value)

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
		IDToken      string `json:"id_token"`
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(teeReader).Decode(&tokenResponse); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if tokenResponse.AccessToken == "" {
		log.Println(err)
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

	// IDトークンのnonceを検証する
	if c, ok := token.Claims.(IDTokenClames); ok {
		if c.Nonce != nonce.Value {
			log.Println("nonce is not equal")
			http.Error(w, "InternalServerError", http.StatusInternalServerError)
			return
		}
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
		SameSite: http.SameSiteLaxMode,
	})
	// リフレッシュトークンをCookieに保存
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    tokenResponse.RefreshToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
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

	// アクセストークンが期限切れの場合、リフレッシュトークンを使ってアクセストークンを更新する
	if errors.Is(err, jwt.ErrTokenExpired) {
		refreshToken, err := r.Cookie("refresh_token")
		if err != nil {
			log.Println("Unauthorized", err)
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		// アクセストークンが期限切れの場合、リフレッシュトークンを使ってアクセストークンを更新する
		newAccessToken, newRefrefreshToken, err := RefreshToken(refreshToken.Value)
		if err != nil {
			log.Println("Unauthorized", err)
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		// アクセストークンをCookieに保存
		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    newAccessToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteLaxMode,
		})
		// リフレッシュトークンをCookieに保存
		http.SetCookie(w, &http.Cookie{
			Name:     "refresh_token",
			Value:    newRefrefreshToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteLaxMode,
		})

		// 認証が成功した場合の処理
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Welcome !!!")
		return
	}

	if err != nil {
		log.Println("Unauthorized", err)
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	// アクセストークンを検証
	if !token.Valid {
		log.Println("Unauthorized", err)
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	// 認証が成功した場合の処理
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Welcome !!!")
}

// RefreshToken returns a new access token and refresh token
func RefreshToken(refreshToken string) (string, string, error) {
	fmt.Println("refresh token")
	tokenURL := fmt.Sprintf("%s/protocol/openid-connect/token", keycloakURL)

	v := url.Values{}
	v.Add("grant_type", "refresh_token")
	v.Add("refresh_token", refreshToken)
	v.Add("client_id", clientID)
	v.Add("client_secret", clientSecret)

	payload := strings.NewReader(v.Encode())
	req, _ := http.NewRequest("POST", tokenURL, payload)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	// v.Add("client_secret", clientSecret) ではなく、Basic認証でもOK
	// req.SetBasicAuth(clientID, clientSecret)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", "", err
	}
	defer res.Body.Close()

	var tmp, out bytes.Buffer
	teeReader := io.TeeReader(res.Body, &tmp)

	// レスポンスからアクセストークンを取得
	var tokenResponse struct {
		IDToken      string `json:"id_token"`
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(teeReader).Decode(&tokenResponse); err != nil {
		return "", "", err
	}

	// responseをterminalに出力する用
	{
		if err := json.Indent(&out, tmp.Bytes(), "", " "); err != nil {
			return "", "", nil
		}
		fmt.Println(out.String())
	}

	if tokenResponse.AccessToken == "" {
		return "", "", errors.New("token is empty")
	}

	return tokenResponse.AccessToken, tokenResponse.RefreshToken, nil
}
