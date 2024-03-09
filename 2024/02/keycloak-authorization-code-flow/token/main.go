package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
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
	// 認証が成功した場合の処理
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Welcome !!!")
}
