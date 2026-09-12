#!/usr/bin/env bash

function kc_par_fetch_discovery() {
  local discovery_file=$1
  local discovery_url="${KC_ISSUER_URL}/.well-known/openid-configuration"

  if ! DISCOVERY_STATUS=$(curl -sS -o "$discovery_file" -w "%{http_code}" "$discovery_url"); then
    printf 'Discovery request failed; is Keycloak ready at %s?\n' "$discovery_url" >&2
    cat "$discovery_file"
    exit 1
  fi
  if [ "$DISCOVERY_STATUS" != "200" ]; then
    if [ "${2:-}" = "discover" ]; then
      printf 'Discovery is not ready: expected HTTP 200.\n' >&2
      exit 1
    fi
    printf 'Discovery HTTP status: %s\n' "$DISCOVERY_STATUS"
    cat "$discovery_file"
    printf 'Discovery is not ready.\n' >&2
    exit 1
  fi

  PAR_ENDPOINT=$(jq -er '.pushed_authorization_request_endpoint // empty' "$discovery_file")
  AUTH_ENDPOINT=$(jq -er '.authorization_endpoint // empty' "$discovery_file")
}

function kc_par_init_oauth_values() {
  STATE=$(openssl rand -hex 16)
  NONCE=$(openssl rand -hex 16)
  CODE_CHALLENGE=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
}

function kc_par_init_basic_auth() {
  BASIC_CLIENT_ID=$(jq -nr --arg value "$KC_CLIENT_ID" '$value | @uri')
  BASIC_CLIENT_SECRET=$(jq -nr --arg value "$KC_CLIENT_SECRET" '$value | @uri')
}

function kc_par_urlencode() {
  jq -nr --arg value "$1" '$value | @uri'
}

function kc_par_post() {
  local response_file=$1
  local redirect_uri=$2

  if ! STATUS=$(curl -sS -o "$response_file" -w "%{http_code}" \
    -u "$BASIC_CLIENT_ID:$BASIC_CLIENT_SECRET" \
    -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "response_type=code" \
    --data-urlencode "client_id=$KC_CLIENT_ID" \
    --data-urlencode "redirect_uri=$redirect_uri" \
    --data-urlencode "scope=openid" \
    --data-urlencode "state=$STATE" \
    --data-urlencode "nonce=$NONCE" \
    --data-urlencode "code_challenge=$CODE_CHALLENGE" \
    --data-urlencode "code_challenge_method=S256" \
    "$PAR_ENDPOINT"); then
    printf 'PAR request failed; is the PAR endpoint ready at %s?\n' "$PAR_ENDPOINT" >&2
    cat "$response_file"
    exit 1
  fi
}
