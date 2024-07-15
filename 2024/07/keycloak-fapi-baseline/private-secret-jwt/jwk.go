package main

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
)

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
