package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
	"fmt"
)

func pbkdf2SHA256(password, salt []byte, iter, keyLen int) ([]byte, error) {
	if iter <= 0 {
		return nil, fmt.Errorf("invalid iteration count: %d", iter)
	}
	if keyLen <= 0 {
		return nil, fmt.Errorf("invalid key length: %d", keyLen)
	}
	hLen := sha256.Size
	blocks := (keyLen + hLen - 1) / hLen
	out := make([]byte, 0, blocks*hLen)

	for i := 1; i <= blocks; i++ {
		mac := hmac.New(sha256.New, password)
		mac.Write(salt)
		var idx [4]byte
		binary.BigEndian.PutUint32(idx[:], uint32(i))
		mac.Write(idx[:])
		u := mac.Sum(nil)
		t := append([]byte{}, u...)

		for j := 2; j <= iter; j++ {
			mac = hmac.New(sha256.New, password)
			mac.Write(u)
			u = mac.Sum(nil)
			for k := 0; k < len(t); k++ {
				t[k] ^= u[k]
			}
		}
		out = append(out, t...)
	}
	return out[:keyLen], nil
}
