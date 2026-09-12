#!/usr/bin/env bash
#MISE description="Verify that PAR request URIs are bound to their client"
set -euo pipefail
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$SCRIPT_DIR/../../../lib/kc-par.sh"
DISCOVERY_FILE=$(mktemp)
PAR_RESPONSE_FILE=$(mktemp)
AUTH_RESPONSE_FILE=$(mktemp)
trap 'rm -f "$DISCOVERY_FILE" "$PAR_RESPONSE_FILE" "$AUTH_RESPONSE_FILE"' EXIT

echo "説明：Client A が取得した request_uri を Client B で使う。両方の生レスポンスを表示し、HTTP 400 とクライアント束縛エラーを確認する"
printf '\n'

kc_par_fetch_discovery "$DISCOVERY_FILE"
kc_par_init_oauth_values
kc_par_init_basic_auth
kc_par_post "$PAR_RESPONSE_FILE" "$BASE_URL/callback"

PAR_STATUS=$STATUS
printf 'Client A PAR HTTP status: %s\n' "$PAR_STATUS"
printf 'Raw client A PAR response:\n'
cat "$PAR_RESPONSE_FILE"
printf '\n'

if [ "$PAR_STATUS" != "201" ]; then
  printf 'Could not obtain a client A request_uri.\n' >&2
  exit 1
fi

REQUEST_URI=$(jq -er '.request_uri // empty' "$PAR_RESPONSE_FILE")
REQUEST_URI_ENCODED=$(kc_par_urlencode "$REQUEST_URI")
CLIENT_ID_ENCODED=$(kc_par_urlencode "$BINDING_CLIENT_ID")
if ! AUTH_STATUS=$(curl -sS -o "$AUTH_RESPONSE_FILE" -w "%{http_code}" \
  --get \
  --data-urlencode "client_id=$BINDING_CLIENT_ID" \
  --data-urlencode "request_uri=$REQUEST_URI" \
  "$AUTH_ENDPOINT"); then
  printf 'Authorization request failed; is the authorization endpoint ready at %s?\n' "$AUTH_ENDPOINT" >&2
  cat "$AUTH_RESPONSE_FILE"
  exit 1
fi
printf 'Client B using client A request_uri HTTP status: %s\n' "$AUTH_STATUS"
printf 'Raw binding response:\n'
cat "$AUTH_RESPONSE_FILE"
printf '\n'
if [ "$AUTH_STATUS" != "400" ]; then
  printf 'Unexpected status: a request_uri must not be accepted by client B.\n' >&2
  exit 1
fi
if ! grep -Fq 'data-page-id="login-error"' "$AUTH_RESPONSE_FILE"; then
  printf 'Response is not the Keycloak login error page.\n' >&2
  exit 1
fi
if ! grep -Eq '<p class="instruction">[[:space:]]*Invalid Request' "$AUTH_RESPONSE_FILE"; then
  printf 'Response does not contain the expected Invalid Request message.\n' >&2
  exit 1
fi
printf 'Checked client B=%s against client A request_uri=%s\n' "$CLIENT_ID_ENCODED" "$REQUEST_URI_ENCODED"
