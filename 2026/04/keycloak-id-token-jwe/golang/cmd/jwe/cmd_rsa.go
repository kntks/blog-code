package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/sha256"
	"flag"
	"fmt"
	"log"
)

func rsaCmd(mode string, args []string) {
	fs := flag.NewFlagSet(mode, flag.ExitOnError)
	plaintext := fs.String("plaintext", "plaintext", "plaintext to encrypt")
	fs.Parse(args)

	pubKey, err := loadEmbeddedRSAPublicKey()
	if err != nil {
		log.Fatalf("load embedded public key: %v", err)
	}
	privKey, err := loadEmbeddedRSAPrivateKey()
	if err != nil {
		log.Fatalf("load embedded private key: %v", err)
	}

	cek, err := generateRandomCEK()
	if err != nil {
		log.Fatalf("generate CEK: %v", err)
	}

	var alg string
	var encryptedKey []byte
	switch mode {
	case "rsa1_5":
		// alg = "RSA1_5"
		// encryptedKey, err = rsa.EncryptPKCS1v15(rand.Reader, pubKey, cek)
		// seehttps://www.ietf.org/archive/id/draft-kario-rsa-guidance-00.html#name-deprecated-algorithms
		log.Fatalf("RSA1_5 is not supported due to security concerns")
	case "rsa_oaep":
		alg = "RSA-OAEP"
		encryptedKey, err = rsa.EncryptOAEP(sha1.New(), rand.Reader, pubKey, cek, nil)
	case "rsa_oaep_256":
		alg = "RSA-OAEP-256"
		encryptedKey, err = rsa.EncryptOAEP(sha256.New(), rand.Reader, pubKey, cek, nil)
	default:
		log.Fatalf("unsupported RSA mode: %s", mode)
	}
	if err != nil {
		log.Fatalf("encrypt CEK: %v", err)
	}

	headers := map[string]any{
		"alg": alg,
		"enc": "A256GCM",
	}
	protectedPart, err := marshalProtected(headers)
	if err != nil {
		log.Fatalf("marshal protected header: %v", err)
	}
	iv, ciphertext, tag, err := encryptA256GCM(cek, []byte(protectedPart), []byte(*plaintext))
	if err != nil {
		log.Fatalf("encrypt plaintext: %v", err)
	}

	compact := compactJWE(protectedPart, encryptedKey, iv, ciphertext, tag)
	fmt.Printf("=== %s mode ===\n", mode)
	fmt.Println("keys: embedded public.pem/private.pem")
	fmt.Println("=== Compact JWE ===")
	fmt.Println(compact)

	var unwrapped []byte
	switch mode {
	case "rsa1_5":
		log.Fatalf("RSA1_5 is not supported due to security concerns (see https://datatracker.ietf.org/doc/html/rfc7518#section-3.2.1)")
	case "rsa_oaep":
		unwrapped, err = rsa.DecryptOAEP(sha1.New(), rand.Reader, privKey, encryptedKey, nil)
	case "rsa_oaep_256":
		unwrapped, err = rsa.DecryptOAEP(sha256.New(), rand.Reader, privKey, encryptedKey, nil)
	}
	if err != nil {
		log.Fatalf("decrypt CEK: %v", err)
	}
	if len(unwrapped) != 32 {
		log.Fatalf("invalid unwrapped CEK length: got %d, want 32", len(unwrapped))
	}
	decrypted, err := decryptA256GCM(unwrapped, []byte(protectedPart), iv, ciphertext, tag)
	if err != nil {
		log.Fatalf("self-check decrypt: %v", err)
	}
	fmt.Printf("Decrypted (self-check): %s\n", string(decrypted))
}
