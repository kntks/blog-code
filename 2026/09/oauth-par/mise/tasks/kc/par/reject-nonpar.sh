#!/usr/bin/env bash
#MISE description="Verify that non-PAR authorization requests are rejected"
set -euo pipefail
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$SCRIPT_DIR/../../../lib/kc-par.sh"
DISCOVERY_FILE=$(mktemp)
HEADER_FILE=$(mktemp)
RESPONSE_FILE=$(mktemp)
trap 'rm -f "$DISCOVERY_FILE" "$HEADER_FILE" "$RESPONSE_FILE"' EXIT
kc_par_fetch_discovery "$DISCOVERY_FILE"
kc_par_init_oauth_values

echo "説明：Client A でrequest_uri なしの通常認可リクエストを送る。生レスポンスヘッダーを表示し、HTTP 302 と Locationの error=invalid_request、PAR 必須を示す説明を確認する"
printf '\n'

STATUS=$(curl -sS -D "$HEADER_FILE" -o "$RESPONSE_FILE" -w "%{http_code}" \
  --get \
  --data-urlencode "response_type=code" \
  --data-urlencode "client_id=$KC_CLIENT_ID" \
  --data-urlencode "redirect_uri=$BASE_URL/callback" \
  --data-urlencode "scope=openid" \
  --data-urlencode "state=$STATE" \
  --data-urlencode "nonce=$NONCE" \
  --data-urlencode "code_challenge=$CODE_CHALLENGE" \
  --data-urlencode "code_challenge_method=S256" \
  "$AUTH_ENDPOINT")

printf 'Non-PAR authorization HTTP status: %s\n' "$STATUS"
printf 'Raw response headers:\n'
cat "$HEADER_FILE"
printf 'Raw response body:\n'
cat "$RESPONSE_FILE"
printf '\n'

if [ "$STATUS" != "302" ]; then
  printf 'Unexpected status: main client non-PAR authorization must be rejected with an OAuth error redirect (HTTP 302).\n' >&2
  exit 1
fi
if ! grep -Eiq '^Location: .*error=invalid_request' "$HEADER_FILE"; then
  printf 'Location header does not contain error=invalid_request.\n' >&2
  exit 1
fi
if ! grep -Eiq '^Location: .*error_description=Pushed[+%]Authorization[+%]Request' "$HEADER_FILE"; then
  printf 'Location header does not explain the PAR requirement.\n' >&2
  exit 1
fi
