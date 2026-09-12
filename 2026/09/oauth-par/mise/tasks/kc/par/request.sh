#!/usr/bin/env bash
#MISE description="Send a pushed authorization request"
set -euo pipefail
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$SCRIPT_DIR/../../../lib/kc-par.sh"
DISCOVERY_FILE=$(mktemp)
RESPONSE_FILE=$(mktemp)
trap 'rm -f "$DISCOVERY_FILE" "$RESPONSE_FILE"' EXIT

echo "説明：Client A で Basic 認証付き PAR を実行し、生レスポンスを表示する。HTTP 201、request_uri、expires_in=300 を確認し、認可 URL（client_id + request_uri）を表示する"
printf '\n'

kc_par_fetch_discovery "$DISCOVERY_FILE"
kc_par_init_oauth_values
kc_par_init_basic_auth
kc_par_post "$RESPONSE_FILE" "$BASE_URL/callback"

printf 'PAR HTTP status: %s\n' "$STATUS"
printf 'Raw PAR response:\n'
cat "$RESPONSE_FILE" | jq
printf '\n'

if [ "$STATUS" != "201" ]; then
  printf 'PAR failed: expected HTTP 201.\n' >&2
  exit 1
fi

REQUEST_URI=$(jq -er '.request_uri // empty' "$RESPONSE_FILE")
EXPIRES_IN=$(jq -er '.expires_in | numbers' "$RESPONSE_FILE")

if [ "$EXPIRES_IN" != "300" ]; then
  printf 'PAR failed: expires_in=%s, want 300.\n' "$EXPIRES_IN" >&2
  exit 1
fi

REQUEST_URI_ENCODED=$(kc_par_urlencode "$REQUEST_URI")
CLIENT_ID_ENCODED=$(kc_par_urlencode "$KC_CLIENT_ID")
printf 'Authorization URL: %s?client_id=%s&request_uri=%s\n' "$AUTH_ENDPOINT" "$CLIENT_ID_ENCODED" "$REQUEST_URI_ENCODED"
