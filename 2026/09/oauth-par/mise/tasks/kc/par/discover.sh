#!/usr/bin/env bash
#MISE description="Check the OpenID Connect discovery document"
set -euo pipefail
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$SCRIPT_DIR/../../../lib/kc-par.sh"
DISCOVERY_FILE=$(mktemp)
trap 'rm -f "$DISCOVERY_FILE"' EXIT

echo "説明：OpenID Connect discovery ドキュメントを取得し、require_pushed_authorization_requests=false であることを確認する"

kc_par_fetch_discovery "$DISCOVERY_FILE" discover

if ! jq -e 'has("require_pushed_authorization_requests") and (.require_pushed_authorization_requests == false)' "$DISCOVERY_FILE" >/dev/null; then
  printf 'Expected require_pushed_authorization_requests=false for this realm.\n' >&2
  exit 1
fi
printf 'pushed_authorization_request_endpoint=%s\n' "$PAR_ENDPOINT"
printf 'authorization_endpoint=%s\n' "$AUTH_ENDPOINT"
printf 'require_pushed_authorization_requests=false\n'
