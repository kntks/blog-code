package main

import (
	"encoding/base64"
	"flag"
	"fmt"
	"log"
)

func pbes2Cmd(args []string) {
	fs := flag.NewFlagSet("pbes2_hs256_a128kw", flag.ExitOnError)
	password := fs.String("pw", "password", "password (for PBES2)")
	p2c := fs.Int("p2c", 10000, "PBKDF2 iteration count")
	plaintext := fs.String("plaintext", "plaintext", "plaintext to encrypt")
	fs.Parse(args)

	if *p2c <= 0 {
		log.Fatalf("invalid p2c: %d", *p2c)
	}

	cek, err := generateRandomCEK()
	if err != nil {
		log.Fatalf("generate CEK: %v", err)
	}
	p2sRaw, err := randomBytes(16)
	if err != nil {
		log.Fatalf("generate p2s: %v", err)
	}

	alg := "PBES2-HS256+A128KW"
	salt := make([]byte, 0, len(alg)+1+len(p2sRaw))
	salt = append(salt, []byte(alg)...)
	salt = append(salt, 0x00)
	salt = append(salt, p2sRaw...)
	kek, err := pbkdf2SHA256([]byte(*password), salt, *p2c, 16)
	if err != nil {
		log.Fatalf("derive KEK: %v", err)
	}

	encryptedKey, err := aesKeyWrap(kek, cek)
	if err != nil {
		log.Fatalf("wrap CEK: %v", err)
	}

	headers := map[string]any{
		"alg": alg,
		"enc": "A256GCM",
		"p2s": base64.RawURLEncoding.EncodeToString(p2sRaw),
		"p2c": *p2c,
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
	fmt.Println("=== PBES2-HS256+A128KW mode ===")
	fmt.Printf("password: %s\n", *password)
	fmt.Println("=== Compact JWE ===")
	fmt.Println(compact)

	kekForDecrypt, err := pbkdf2SHA256([]byte(*password), salt, *p2c, 16)
	if err != nil {
		log.Fatalf("derive KEK (decrypt): %v", err)
	}
	unwrapped, err := aesKeyUnwrap(kekForDecrypt, encryptedKey)
	if err != nil {
		log.Fatalf("unwrap CEK: %v", err)
	}
	decrypted, err := decryptA256GCM(unwrapped, []byte(protectedPart), iv, ciphertext, tag)
	if err != nil {
		log.Fatalf("self-check decrypt: %v", err)
	}
	fmt.Printf("Decrypted (self-check): %s\n", string(decrypted))
}
