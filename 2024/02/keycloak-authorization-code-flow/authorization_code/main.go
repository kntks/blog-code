package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
)

const (
	keycloakRealm = "myrealm"
	keycloakURL   = "http://localhost:8080/realms/" + keycloakRealm
	clientID      = "myapp"
	clientSecret  = "eBas7IaiufKgtSH9qrpDxXEzTCTytRIS"
)

func main() {
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/callback", handleCallback)

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
		return
	}
	redirectURL.RawQuery = v.Encode()

	http.Redirect(w, r, redirectURL.String(), http.StatusSeeOther)
}

// Keycloak で認証後、リダイレクトされ、この関数が呼ばれる
func handleCallback(w http.ResponseWriter, r *http.Request) {
	bytes, err := json.MarshalIndent(r.URL.Query(), "", "  ")
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println(string(bytes))
	fmt.Fprintln(w, string(bytes))
}
