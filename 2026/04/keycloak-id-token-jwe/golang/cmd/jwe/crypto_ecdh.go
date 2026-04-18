package main

import (
	"crypto/ecdh"
	"crypto/ecdsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"fmt"
)

func lengthPrefixed(data []byte) []byte {
	out := make([]byte, 4+len(data))
	binary.BigEndian.PutUint32(out[:4], uint32(len(data)))
	copy(out[4:], data)
	return out
}

func concatKDFSHA256(z []byte, keyDataLenBits int, algorithmID string, apu, apv []byte) ([]byte, error) {
	if keyDataLenBits%8 != 0 || keyDataLenBits <= 0 {
		return nil, fmt.Errorf("invalid keyDataLenBits: %d", keyDataLenBits)
	}
	keyDataLen := keyDataLenBits / 8
	otherInfo := make([]byte, 0, 4+len(algorithmID)+4+len(apu)+4+len(apv)+4)
	otherInfo = append(otherInfo, lengthPrefixed([]byte(algorithmID))...)
	otherInfo = append(otherInfo, lengthPrefixed(apu)...)
	otherInfo = append(otherInfo, lengthPrefixed(apv)...)
	suppPubInfo := make([]byte, 4)
	binary.BigEndian.PutUint32(suppPubInfo, uint32(keyDataLenBits))
	otherInfo = append(otherInfo, suppPubInfo...)

	hashLen := sha256.Size
	reps := (keyDataLen + hashLen - 1) / hashLen
	out := make([]byte, 0, reps*hashLen)
	for counter := 1; counter <= reps; counter++ {
		h := sha256.New()
		var ctr [4]byte
		binary.BigEndian.PutUint32(ctr[:], uint32(counter))
		h.Write(ctr[:])
		h.Write(z)
		h.Write(otherInfo)
		out = append(out, h.Sum(nil)...)
	}
	return out[:keyDataLen], nil
}

func leftPad(b []byte, n int) []byte {
	if len(b) >= n {
		return append([]byte{}, b[len(b)-n:]...)
	}
	out := make([]byte, n)
	copy(out[n-len(b):], b)
	return out
}

func deriveECDHSharedSecret(priv *ecdsa.PrivateKey, pub *ecdsa.PublicKey) ([]byte, error) {
	if priv == nil || priv.Curve == nil || pub == nil || pub.Curve == nil {
		return nil, errors.New("missing EC key")
	}
	if priv.Curve.Params().Name != pub.Curve.Params().Name {
		return nil, errors.New("EC key curve mismatch")
	}

	curve, err := ecdhCurveFromName(pub.Curve.Params().Name)
	if err != nil {
		return nil, err
	}

	size := (pub.Curve.Params().BitSize + 7) / 8
	pubEncoded := make([]byte, 1+2*size)
	pubEncoded[0] = 0x04
	copy(pubEncoded[1:1+size], leftPad(pub.X.Bytes(), size))
	copy(pubEncoded[1+size:], leftPad(pub.Y.Bytes(), size))

	ecdhPub, err := curve.NewPublicKey(pubEncoded)
	if err != nil {
		return nil, fmt.Errorf("parse ECDH public key: %w", err)
	}

	ecdhPriv, err := curve.NewPrivateKey(leftPad(priv.D.Bytes(), size))
	if err != nil {
		return nil, fmt.Errorf("parse ECDH private key: %w", err)
	}

	z, err := ecdhPriv.ECDH(ecdhPub)
	if err != nil {
		return nil, fmt.Errorf("derive shared secret: %w", err)
	}
	return z, nil
}

func ecdhCurveFromName(name string) (ecdh.Curve, error) {
	switch name {
	case "P-256":
		return ecdh.P256(), nil
	case "P-384":
		return ecdh.P384(), nil
	case "P-521":
		return ecdh.P521(), nil
	default:
		return nil, fmt.Errorf("unsupported EC curve: %s", name)
	}
}

func epkHeader(pub *ecdsa.PublicKey) (map[string]any, error) {
	if pub == nil || pub.Curve == nil || pub.Curve.Params().Name != "P-256" {
		return nil, errors.New("unsupported ephemeral key curve (want P-256)")
	}
	size := (pub.Curve.Params().BitSize + 7) / 8
	return map[string]any{
		"kty": "EC",
		"crv": "P-256",
		"x":   base64.RawURLEncoding.EncodeToString(leftPad(pub.X.Bytes(), size)),
		"y":   base64.RawURLEncoding.EncodeToString(leftPad(pub.Y.Bytes(), size)),
	}, nil
}
