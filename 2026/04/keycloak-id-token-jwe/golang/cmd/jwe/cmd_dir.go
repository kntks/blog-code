package main

import (
	"encoding/base64"
	"flag"
	"fmt"
	"log"
)

func dirCmd(args []string) {
	fs := flag.NewFlagSet("dir", flag.ExitOnError)
	cek := fs.String("cek", "", "CEK (base64url/base64/hex, 32-byte key for A256GCM) - optional")
	plaintext := fs.String("plaintext", "plaintext", "plaintext to encrypt")
	fs.Parse(args)
	fmt.Println("=== DIR mode ===")

	headers := map[string]any{
		"alg": "dir",
		"enc": "A256GCM",
	}

	protectedPart, err := marshalProtected(headers)
	if err != nil {
		log.Fatalf("marshal protected header: %v", err)
	}
	fmt.Printf("Protected Header (b64url): %s\n", protectedPart)

	var key []byte
	if *cek == "" {
		key, err = generateRandomCEK()
		if err != nil {
			log.Fatalf("generate CEK: %v", err)
		}
		fmt.Printf("Generated CEK (b64url): %s\n", base64.RawURLEncoding.EncodeToString(key))
	} else {
		key, err = decodeKeyMaterial(*cek, 32)
		if err != nil {
			log.Fatalf("decode CEK: %v", err)
		}
		fmt.Printf("Provided CEK (b64url): %s\n", base64.RawURLEncoding.EncodeToString(key))
	}

	iv, ciphertext, tag, err := encryptA256GCM(key, []byte(protectedPart), []byte(*plaintext))
	if err != nil {
		log.Fatalf("encrypt plaintext: %v", err)
	}
	compact := compactJWE(protectedPart, nil, iv, ciphertext, tag)

	fmt.Println("=== Compact JWE (dir/A256GCM) ===")
	fmt.Println(compact)

	decrypted, err := decryptA256GCM(key, []byte(protectedPart), iv, ciphertext, tag)
	if err != nil {
		log.Fatalf("self-check decrypt: %v", err)
	}
	fmt.Printf("Decrypted (self-check): %s\n", string(decrypted))
}
