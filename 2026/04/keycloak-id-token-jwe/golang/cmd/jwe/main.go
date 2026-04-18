package main

import (
	_ "embed"
	"fmt"
	"os"
)

//go:embed private.pem
var embeddedPrivateKey []byte

//go:embed public.pem
var embeddedPublicKey []byte

func usage() {
	fmt.Fprintf(os.Stderr, `usage: jwe <mode> [options]

modes:
  dir                     Direct mode (dir)
  a128kw                  AES Key Wrap A128KW
  a192kw                  AES Key Wrap A192KW
  a256kw                  AES Key Wrap A256KW
  rsa1_5                  RSA1_5
  rsa_oaep                RSA-OAEP
  rsa_oaep_256            RSA-OAEP-256
  ecdh_es                 ECDH-ES
  ecdh_es_a128kw          ECDH-ES + A128KW
  pbes2_hs256_a128kw      PBES2-HS256+A128KW
  help
`)
}

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(1)
	}
	switch os.Args[1] {
	case "dir":
		dirCmd(os.Args[2:])
	case "a128kw", "a192kw", "a256kw":
		kwCmd(os.Args[1], os.Args[2:])
	case "rsa1_5", "rsa_oaep", "rsa_oaep_256":
		rsaCmd(os.Args[1], os.Args[2:])
	case "ecdh_es", "ecdh_es_a128kw":
		ecdhCmd(os.Args[1], os.Args[2:])
	case "pbes2_hs256_a128kw":
		pbes2Cmd(os.Args[2:])
	case "help":
		usage()
	default:
		fmt.Fprintf(os.Stderr, "unknown mode: %s\n\n", os.Args[1])
		usage()
		os.Exit(2)
	}
}
