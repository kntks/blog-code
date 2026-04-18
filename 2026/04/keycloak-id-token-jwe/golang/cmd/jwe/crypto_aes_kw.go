package main

import (
	"bytes"
	"crypto/aes"
	"errors"
	"fmt"
)

func aesKeyWrap(kek, plaintext []byte) ([]byte, error) {
	if len(plaintext)%8 != 0 || len(plaintext) < 16 {
		return nil, fmt.Errorf("invalid plaintext length for AES-KW: %d", len(plaintext))
	}
	block, err := aes.NewCipher(kek)
	if err != nil {
		return nil, fmt.Errorf("create AES cipher for key wrap: %w", err)
	}

	n := len(plaintext) / 8
	a := []byte{0xA6, 0xA6, 0xA6, 0xA6, 0xA6, 0xA6, 0xA6, 0xA6}
	r := make([][]byte, n)
	for i := 0; i < n; i++ {
		r[i] = append([]byte{}, plaintext[i*8:(i+1)*8]...)
	}

	buf := make([]byte, 16)
	for j := 0; j <= 5; j++ {
		for i := 1; i <= n; i++ {
			copy(buf[:8], a)
			copy(buf[8:], r[i-1])
			block.Encrypt(buf, buf)
			copy(a, buf[:8])
			t := uint64(n*j + i)
			for k := 7; k >= 0; k-- {
				a[k] ^= byte(t)
				t >>= 8
			}
			copy(r[i-1], buf[8:])
		}
	}

	out := make([]byte, 8+n*8)
	copy(out[:8], a)
	for i := 0; i < n; i++ {
		copy(out[8+i*8:8+(i+1)*8], r[i])
	}
	return out, nil
}

func aesKeyUnwrap(kek, wrapped []byte) ([]byte, error) {
	if len(wrapped)%8 != 0 || len(wrapped) < 24 {
		return nil, fmt.Errorf("invalid wrapped length for AES-KW: %d", len(wrapped))
	}
	block, err := aes.NewCipher(kek)
	if err != nil {
		return nil, fmt.Errorf("create AES cipher for key unwrap: %w", err)
	}

	n := len(wrapped)/8 - 1
	a := append([]byte{}, wrapped[:8]...)
	r := make([][]byte, n)
	for i := range n {
		r[i] = append([]byte{}, wrapped[8+i*8:8+(i+1)*8]...)
	}

	buf := make([]byte, 16)
	for j := 5; j >= 0; j-- {
		for i := n; i >= 1; i-- {
			t := uint64(n*j + i)
			aXor := append([]byte{}, a...)
			for k := 7; k >= 0; k-- {
				aXor[k] ^= byte(t)
				t >>= 8
			}
			copy(buf[:8], aXor)
			copy(buf[8:], r[i-1])
			block.Decrypt(buf, buf)
			copy(a, buf[:8])
			copy(r[i-1], buf[8:])
		}
	}

	if !bytes.Equal(a, []byte{0xA6, 0xA6, 0xA6, 0xA6, 0xA6, 0xA6, 0xA6, 0xA6}) {
		return nil, errors.New("AES-KW integrity check failed")
	}

	out := make([]byte, n*8)
	for i := range n {
		copy(out[i*8:(i+1)*8], r[i])
	}
	return out, nil
}
