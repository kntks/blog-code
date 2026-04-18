package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"strings"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func TestClientPublicJWKFromPEM_UsesEncryptionMetadata(t *testing.T) {
	key, err := clientPublicJWKFromPEM()
	if err != nil {
		t.Fatalf("clientPublicJWKFromPEM() error = %v", err)
	}

	if key.Use != "enc" {
		t.Fatalf("key.Use = %q, want %q", key.Use, "enc")
	}
	if key.Alg != "RSA-OAEP" {
		t.Fatalf("key.Alg = %q, want %q", key.Alg, "RSA-OAEP")
	}
	if key.Kid != clientKeyID {
		t.Fatalf("key.Kid = %q, want %q", key.Kid, clientKeyID)
	}
}

func TestNormalizeIDToken_DecryptsCompactJWE(t *testing.T) {
	t.Parallel()

	const plaintext = "header.payload.signature"

	raw, err := buildCompactJWEForTest(plaintext)
	if err != nil {
		t.Fatalf("buildCompactJWEForTest() error = %v", err)
	}

	got, err := normalizeIDToken(raw)
	if err != nil {
		t.Fatalf("normalizeIDToken() error = %v", err)
	}
	if got != plaintext {
		t.Fatalf("normalizeIDToken() = %q, want %q", got, plaintext)
	}
}

func buildCompactJWEForTest(plaintext string) (string, error) {
	protected := jweHeader{
		Alg: "RSA-OAEP",
		Enc: "A256GCM",
		Kid: clientKeyID,
	}

	protectedJSON, err := json.Marshal(protected)
	if err != nil {
		return "", err
	}
	protectedPart := base64.RawURLEncoding.EncodeToString(protectedJSON)

	cek := make([]byte, 32)
	if _, err := rand.Read(cek); err != nil {
		return "", err
	}

	iv := make([]byte, 12)
	if _, err := rand.Read(iv); err != nil {
		return "", err
	}

	pub, err := jwt.ParseRSAPublicKeyFromPEM(embeddedPublicKey)
	if err != nil {
		return "", err
	}

	encryptedKey, err := rsa.EncryptOAEP(sha1.New(), rand.Reader, pub, cek, nil)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(cek)
	if err != nil {
		return "", err
	}

	aead, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	sealed := aead.Seal(nil, iv, []byte(plaintext), []byte(protectedPart))
	tagSize := aead.Overhead()
	ciphertext := sealed[:len(sealed)-tagSize]
	tag := sealed[len(sealed)-tagSize:]

	parts := []string{
		protectedPart,
		base64.RawURLEncoding.EncodeToString(encryptedKey),
		base64.RawURLEncoding.EncodeToString(iv),
		base64.RawURLEncoding.EncodeToString(ciphertext),
		base64.RawURLEncoding.EncodeToString(tag),
	}
	return strings.Join(parts, "."), nil
}
