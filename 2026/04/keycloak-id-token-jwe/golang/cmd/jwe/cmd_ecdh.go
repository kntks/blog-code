package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"flag"
	"fmt"
	"log"
)

func ecdhCmd(mode string, args []string) {
	fs := flag.NewFlagSet(mode, flag.ExitOnError)
	plaintext := fs.String("plaintext", "plaintext", "plaintext to encrypt")
	fs.Parse(args)

	recipientPriv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		log.Fatalf("generate recipient key: %v", err)
	}
	senderEphemeralPriv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		log.Fatalf("generate ephemeral key: %v", err)
	}
	zSender, err := deriveECDHSharedSecret(senderEphemeralPriv, &recipientPriv.PublicKey)
	if err != nil {
		log.Fatalf("derive sender ECDH secret: %v", err)
	}

	epk, err := epkHeader(&senderEphemeralPriv.PublicKey)
	if err != nil {
		log.Fatalf("build epk header: %v", err)
	}

	var alg string
	var cek []byte
	var encryptedKey []byte
	switch mode {
	case "ecdh_es":
		alg = "ECDH-ES"
		cek, err = concatKDFSHA256(zSender, 256, "A256GCM", nil, nil)
		if err != nil {
			log.Fatalf("derive CEK: %v", err)
		}
	case "ecdh_es_a128kw":
		alg = "ECDH-ES+A128KW"
		kek, err := concatKDFSHA256(zSender, 128, "A128KW", nil, nil)
		if err != nil {
			log.Fatalf("derive KEK: %v", err)
		}
		cek, err = generateRandomCEK()
		if err != nil {
			log.Fatalf("generate CEK: %v", err)
		}
		encryptedKey, err = aesKeyWrap(kek, cek)
		if err != nil {
			log.Fatalf("wrap CEK: %v", err)
		}
	default:
		log.Fatalf("unsupported ECDH mode: %s", mode)
	}

	headers := map[string]any{
		"alg": alg,
		"enc": "A256GCM",
		"epk": epk,
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

	zRecipient, err := deriveECDHSharedSecret(recipientPriv, &senderEphemeralPriv.PublicKey)
	if err != nil {
		log.Fatalf("derive recipient ECDH secret: %v", err)
	}

	var cekForDecrypt []byte
	switch mode {
	case "ecdh_es":
		cekForDecrypt, err = concatKDFSHA256(zRecipient, 256, "A256GCM", nil, nil)
		if err != nil {
			log.Fatalf("derive recipient CEK: %v", err)
		}
	case "ecdh_es_a128kw":
		kek, err := concatKDFSHA256(zRecipient, 128, "A128KW", nil, nil)
		if err != nil {
			log.Fatalf("derive recipient KEK: %v", err)
		}
		cekForDecrypt, err = aesKeyUnwrap(kek, encryptedKey)
		if err != nil {
			log.Fatalf("unwrap CEK: %v", err)
		}
	}

	decrypted, err := decryptA256GCM(cekForDecrypt, []byte(protectedPart), iv, ciphertext, tag)
	if err != nil {
		log.Fatalf("self-check decrypt: %v", err)
	}
	fmt.Printf("Decrypted (self-check): %s\n", string(decrypted))
}
