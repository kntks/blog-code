package main

import (
	"encoding/base64"
	"flag"
	"fmt"
	"log"
)

func kwCmd(mode string, args []string) {
	fs := flag.NewFlagSet(mode, flag.ExitOnError)
	key := fs.String("key", "", "wrapping key (base64url/base64/hex)")
	plaintext := fs.String("plaintext", "plaintext", "plaintext to encrypt")
	fs.Parse(args)

	var alg string
	var keyLen int
	switch mode {
	case "a128kw":
		alg = "A128KW"
		keyLen = 16
	case "a192kw":
		alg = "A192KW"
		keyLen = 24
	case "a256kw":
		alg = "A256KW"
		keyLen = 32
	default:
		log.Fatalf("unsupported AES-KW mode: %s", mode)
	}

	var kek []byte
	var err error
	if *key == "" {
		kek, err = randomBytes(keyLen)
		if err != nil {
			log.Fatalf("generate wrapping key: %v", err)
		}
		fmt.Printf("Generated wrapping key (b64url): %s\n", base64.RawURLEncoding.EncodeToString(kek))
	} else {
		kek, err = decodeKeyMaterial(*key, keyLen)
		if err != nil {
			log.Fatalf("decode wrapping key: %v", err)
		}
		fmt.Printf("Provided wrapping key (b64url): %s\n", base64.RawURLEncoding.EncodeToString(kek))
	}

	cek, err := generateRandomCEK()
	if err != nil {
		log.Fatalf("generate CEK: %v", err)
	}
	encryptedKey, err := aesKeyWrap(kek, cek)
	if err != nil {
		log.Fatalf("wrap CEK: %v", err)
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
	fmt.Println("=== Compact JWE ===")
	fmt.Println(compact)

	unwrapped, err := aesKeyUnwrap(kek, encryptedKey)
	if err != nil {
		log.Fatalf("unwrap CEK: %v", err)
	}
	decrypted, err := decryptA256GCM(unwrapped, []byte(protectedPart), iv, ciphertext, tag)
	if err != nil {
		log.Fatalf("self-check decrypt: %v", err)
	}
	fmt.Printf("Decrypted (self-check): %s\n", string(decrypted))
}
