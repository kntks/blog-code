package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"fmt"
	"io"
)

func randomBytes(n int) ([]byte, error) {
	buf := make([]byte, n)
	_, err := io.ReadFull(rand.Reader, buf)
	if err != nil {
		return nil, err
	}
	return buf, nil
}

func encryptA256GCM(cek []byte, aad []byte, plaintext []byte) (iv, ciphertext, tag []byte, err error) {
	block, err := aes.NewCipher(cek)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("create cipher: %w", err)
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("create GCM: %w", err)
	}

	iv = make([]byte, aead.NonceSize())
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, nil, nil, fmt.Errorf("generate IV: %w", err)
	}

	sealed := aead.Seal(nil, iv, plaintext, aad)
	tagSize := aead.Overhead()
	if len(sealed) < tagSize {
		return nil, nil, nil, fmt.Errorf("invalid sealed length: got %d, tag size %d", len(sealed), tagSize)
	}
	ciphertext = sealed[:len(sealed)-tagSize]
	tag = sealed[len(sealed)-tagSize:]
	return iv, ciphertext, tag, nil
}

func decryptA256GCM(cek []byte, aad []byte, iv, ciphertext, tag []byte) ([]byte, error) {
	block, err := aes.NewCipher(cek)
	if err != nil {
		return nil, fmt.Errorf("create cipher: %w", err)
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("create GCM: %w", err)
	}
	combined := append(append([]byte{}, ciphertext...), tag...)
	plaintext, err := aead.Open(nil, iv, combined, aad)
	if err != nil {
		return nil, fmt.Errorf("decrypt ciphertext: %w", err)
	}
	return plaintext, nil
}
