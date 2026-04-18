package main

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
)

func parseRSAPublicKeyFromPEM(pemBytes []byte) (*rsa.PublicKey, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, errors.New("invalid PEM block for RSA public key")
	}
	if pubAny, err := x509.ParsePKIXPublicKey(block.Bytes); err == nil {
		if pub, ok := pubAny.(*rsa.PublicKey); ok {
			return pub, nil
		}
		return nil, fmt.Errorf("PEM is not RSA public key: %T", pubAny)
	}
	pub, err := x509.ParsePKCS1PublicKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse RSA public key: %w", err)
	}
	return pub, nil
}

func parseRSAPrivateKeyFromPEM(pemBytes []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, errors.New("invalid PEM block for RSA private key")
	}
	if keyAny, err := x509.ParsePKCS8PrivateKey(block.Bytes); err == nil {
		if key, ok := keyAny.(*rsa.PrivateKey); ok {
			return key, nil
		}
		return nil, fmt.Errorf("PEM is not RSA private key: %T", keyAny)
	}
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse RSA private key: %w", err)
	}
	return key, nil
}

func loadEmbeddedRSAPublicKey() (*rsa.PublicKey, error) {
	return parseRSAPublicKeyFromPEM(embeddedPublicKey)
}

func loadEmbeddedRSAPrivateKey() (*rsa.PrivateKey, error) {
	return parseRSAPrivateKeyFromPEM(embeddedPrivateKey)
}
