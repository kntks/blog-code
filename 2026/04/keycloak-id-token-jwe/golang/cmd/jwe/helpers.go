package main

import (
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

func generateRandomCEK() ([]byte, error) {
	return randomBytes(32)
}

func decodeKeyMaterial(raw string, expectedLen int) ([]byte, error) {
	if raw == "" {
		return nil, errors.New("key material is empty")
	}

	var decodeErrs []string
	try := func(name string, fn func(string) ([]byte, error)) ([]byte, bool) {
		b, err := fn(raw)
		if err != nil {
			decodeErrs = append(decodeErrs, fmt.Sprintf("%s: %v", name, err))
			return nil, false
		}
		if expectedLen > 0 && len(b) != expectedLen {
			decodeErrs = append(decodeErrs, fmt.Sprintf("%s: key length %d (want %d)", name, len(b), expectedLen))
			return nil, false
		}
		return b, true
	}

	if b, ok := try("base64url", base64.RawURLEncoding.DecodeString); ok {
		return b, nil
	}
	if b, ok := try("base64", base64.StdEncoding.DecodeString); ok {
		return b, nil
	}
	if b, ok := try("hex", hex.DecodeString); ok {
		return b, nil
	}
	return nil, fmt.Errorf("decode key material failed (%s)", strings.Join(decodeErrs, "; "))
}

func marshalProtected(headers map[string]any) (string, error) {
	raw, err := json.Marshal(headers)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(raw), nil
}

func compactJWE(protectedPart string, encryptedKey []byte, iv, ciphertext, tag []byte) string {
	return strings.Join([]string{
		protectedPart,
		base64.RawURLEncoding.EncodeToString(encryptedKey),
		base64.RawURLEncoding.EncodeToString(iv),
		base64.RawURLEncoding.EncodeToString(ciphertext),
		base64.RawURLEncoding.EncodeToString(tag),
	}, ".")
}
