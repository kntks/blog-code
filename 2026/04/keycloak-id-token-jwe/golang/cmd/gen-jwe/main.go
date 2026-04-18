package main

import (
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/golang-jwt/jwe"
)

const privateKeyPEM = `
-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCzt9ATGSXqfpkg
k8T0I0wYUew8apIjwqzo9R0RZEAIraGKENUuS1rXTS0bGs5BaCofnJFUsZ1Ri8yD
EtLG47o2LghuUBnWDbITVfbqhvdMbbK5kkVTsfUPa+zAzRoI8hWfrHCGLLqXffmI
ECi5EAgzbNaIZI/74KeN/Ais+BsfX59YK1xWgOr7UqAPTjnHWykFKx/ObwQO8XZu
JZF9JyaeNptHJFe5wHhh9zUl+SkRyCcCozjciauElmpWgBx77pL12eUxAASjsLQN
vZRxUyUszDExbfvLdDNAajDC1aDlfYYt+MV1ZoQIYHEfhGbSoLJaKgXZnbF0Q0GU
2pM62BonAgMBAAECggEAAzmRKkaRP5v183ezWQ4pF2ag7pSa+rlLkQKU+vLpkz5K
X8fdi28eui5QWOQqP1I3L0oH8ZUeVZBEozV7QsZjWQWKcTBOxmCIiYBJZfv2BBET
2/Cb/dx7oUM2hF8p0G9HpA3cFwxGbOF90Ms5b9ixzPpu/xOO4d4uI4YaQcBR/EYb
SbMaxX2OjhAIB1Uc9jwqheCpbNNAA3WcrCxJF5dYiL5kIdW8/7ix+a8luxb7v5re
3pEPno4Y0XS8ORW9GQalwIhuR5T3MH91S082pIp9F7VDsdCRGgHOIaDk9BOXjzFE
Dlv10JUPw1hfRy9gaymcLM3fiq8bnhVZDONofGU/gQKBgQDfEsKOawbzVkyz5uXF
1mbx7QX7oyRa/U59y4pFPR8S4bkIvFKbo+LR7xvQbOeOSBDd0ATrex/BK35jUOLS
A1ag0UGnue6OLBxLSrUw9hZa7gTRKeFR01gaouPXeCgp1G6RRxu7d+ao+lwBvxxy
8R2v56iWGTAiqetK3d45TMOG/wKBgQDOPssYrLYKA18ngdi3IXhnaU1Y9gduI5GH
DKEeIJbaP1YytfMTtpXhJD7JPiNFwwzzjTD7nR8q4XaS0PFHQcq3HEhjxnh6gJTj
zj3zNVTQu6dJlyqBWr4Gc/Djh4LgsRiyznqbSX/Hz0tD74Brfc4JwisoOqBuUDqL
/yh11jFU2QKBgQCm/h9BiGOipJc1EgQur0tPjnWtJDsiFoC88TNok9IAS5Q+MuTQ
eMZjDFHRHMXXoKFnu8MDGZ/y9wFdjf7O4wrlxuEUk78/FUx1HM85gO/JUGewwV5Y
6BMLladk9SFz9wBypz3egGrfUtSvxgahEVl9BroQ63g6auOmnyMt2AaDtwKBgQCP
6ACOFvRtyCx8xH0SSqhYf4EYsZI9p1PDh2xkORkI72iVuZ8CAkRR85hbkp/J7W78
AWhMKDW3FdpGVsQDlER9v55DABjQYSeCTEWtjWjAvC7dijx+RXKRzhQmrkcDwI4b
NTcXYxFluZ4qqNJSLlW1OWYji8SlNBWl2UPB9NI3AQKBgQCRIMCjw2NAA1rFXvux
HlrI9mDnCU53nYci6En5uYaliECG7/mZ6GnwV0cE5GUew6+TjRwmMbnj4JTDV2j/
70Q8S13ktJf9MviBacYyou7wcmF37zXY8zHmJWe6+1AHMpgQ94Uw0d71e/Ks0fF4
zJTkPpaFA28flsFOknLQnPUTWg==
-----END PRIVATE KEY-----
`

const publicKeyPEM = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs7fQExkl6n6ZIJPE9CNM
GFHsPGqSI8Ks6PUdEWRACK2hihDVLkta100tGxrOQWgqH5yRVLGdUYvMgxLSxuO6
Ni4IblAZ1g2yE1X26ob3TG2yuZJFU7H1D2vswM0aCPIVn6xwhiy6l335iBAouRAI
M2zWiGSP++CnjfwIrPgbH1+fWCtcVoDq+1KgD045x1spBSsfzm8EDvF2biWRfScm
njabRyRXucB4Yfc1JfkpEcgnAqM43ImrhJZqVoAce+6S9dnlMQAEo7C0Db2UcVMl
LMwxMW37y3QzQGowwtWg5X2GLfjFdWaECGBxH4Rm0qCyWioF2Z2xdENBlNqTOtga
JwIDAQAB
-----END PUBLIC KEY-----
`

// public.pem でプレーンテキスト(Inner JWT)を暗号化し、compact JWE を出力する。
// 復号は private.pem で行い、結果を検証する。
func readPEMFile() (pubKey *rsa.PublicKey, privKey *rsa.PrivateKey, err error) {

	pubKey, err = jwe.ParseRSAPublicKeyFromPEM([]byte(publicKeyPEM))
	if err != nil {
		log.Fatalf("parse public key: %v", err)
	}
	privKey, err = jwe.ParseRSAPrivateKeyFromPEM([]byte(privateKeyPEM))
	if err != nil {
		log.Fatalf("parse private key: %v", err)
	}
	return pubKey, privKey, nil
}

func main() {
	pubKey, privKey, err := readPEMFile()
	if err != nil {
		log.Fatalf("read PEM files: %v", err)
	}
	// JWE のペイロードとなる JWT クレームを JSON で用意する
	claims := map[string]any{
		"sub":   "myuser",
		"iss":   "http://localhost:8080/realms/myrealm",
		"aud":   "myapp",
		"iat":   time.Now().Unix(),
		"exp":   time.Now().Add(5 * time.Minute).Unix(),
		"nonce": "example-nonce",
	}
	plaintext, err := json.Marshal(claims)
	if err != nil {
		log.Fatalf("marshal claims: %v", err)
	}

	// RSA-OAEP で CEK を暗号化し、A256GCM でペイロードを暗号化
	token, err := jwe.NewJWE(jwe.KeyAlgorithmRSAOAEP, pubKey, jwe.EncryptionTypeA256GCM, plaintext)
	if err != nil {
		log.Fatalf("create JWE: %v", err)
	}

	compact, err := token.CompactSerialize()
	if err != nil {
		log.Fatalf("serialize JWE: %v", err)
	}

	fmt.Println("=== Compact JWE ===")
	fmt.Println(compact)

	// 復号して検証
	parsed, err := jwe.ParseEncrypted(compact)
	if err != nil {
		log.Fatalf("parse JWE: %v", err)
	}
	decrypted, err := parsed.Decrypt(privKey)
	if err != nil {
		log.Fatalf("decrypt JWE: %v", err)
	}

	fmt.Println("\n=== Decrypted Payload ===")
	var pretty map[string]any
	if err := json.Unmarshal(decrypted, &pretty); err != nil {
		log.Fatalf("unmarshal decrypted: %v", err)
	}
	out, _ := json.MarshalIndent(pretty, "", "  ")
	fmt.Println(string(out))
}
