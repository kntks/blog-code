#!/usr/bin/env bash
#MISE description="Run all PAR verification tasks"
set -euo pipefail

echo "確認内容：以下の5タスクを discover、request、reject-redirect、reject-nonpar、reject-binding の順に実行する"
echo "各タスクは生レスポンスを表示し、終了ステータスと内容を自動判定する"

mise run kc:par:discover
mise run kc:par:request
mise run kc:par:reject-redirect
mise run kc:par:reject-nonpar
mise run kc:par:reject-binding
