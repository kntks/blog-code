package main

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

type IDTokenClames struct {
	AuthorizedParty string `json:"azp,omitempty"`
	AccessTokenHash string `json:"at_hash,omitempty"`
	Nonce           string `json:"nonce"`
	jwt.RegisteredClaims
}

func (i *IDTokenClames) Validate() error {
	if i.AuthorizedParty != clientID {
		return errors.New("azp does not match the client ID")
	}
	return nil
}

type AccessTokenClaims struct {
	AuthorizedParty string `json:"azp,omitempty"`
	jwt.RegisteredClaims
}

func (a *AccessTokenClaims) Validate() error {
	if a.AuthorizedParty != clientID {
		return errors.New("azp does not match the client ID")
	}
	return nil
}
