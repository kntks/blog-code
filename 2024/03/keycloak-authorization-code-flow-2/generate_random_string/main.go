package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
)

func randString(nByte int) (string, error) {
	b := make([]byte, nByte)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func main() {
	r, err := randString(128)
	if err != nil {
		log.Println(err)
		return
	}

	fmt.Println(r)
}
