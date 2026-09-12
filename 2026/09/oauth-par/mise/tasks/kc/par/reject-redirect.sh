#!/usr/bin/env bash
#MISE description="Verify that an unregistered redirect URI is rejected"
set -euo pipefail
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$SCRIPT_DIR/../../../lib/kc-par.sh"
DISCOVERY_FILE=$(mktemp)
RESPONSE_FILE=$(mktemp)
trap 'rm -f "$DISCOVERY_FILE" "$RESPONSE_FILE"' EXIT

echo "説明：未登録の redirect_uri を含む Pushed Authorization Request を PAR エンドポイントへ送る。生レスポンスを表示し、HTTP 400 と OAuth エラーの手掛かりを確認する"
printf '\n'

kc_par_fetch_discovery "$DISCOVERY_FILE"
kc_par_init_oauth_values
kc_par_init_basic_auth
kc_par_post "$RESPONSE_FILE" "$BASE_URL/unregistered"

printf 'Unregistered redirect PAR HTTP status: %s\n' "$STATUS"
printf 'Raw response:\n'
cat "$RESPONSE_FILE"
printf '\n'
if [ "$STATUS" != "400" ]; then
  printf 'Unexpected status: unregistered redirect_uri must be rejected with HTTP 400.\n' >&2
  exit 1
fi
if [ "$(jq -r '.error // empty' "$RESPONSE_FILE")" != "invalid_request" ]; then
  printf 'Response error is not invalid_request.\n' >&2
  exit 1
fi
if ! jq -e '.error_description | strings | test("redirect_uri"; "i")' "$RESPONSE_FILE" >/dev/null; then
  printf 'Response error_description does not identify redirect_uri.\n' >&2
  exit 1
fi
