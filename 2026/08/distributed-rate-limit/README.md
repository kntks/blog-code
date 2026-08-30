# Distributed Rate Limit

Goアプリケーションを2 replicasで起動し、Fixed Windowのカウンタを各プロセスのメモリに保存する`local`モードと、Valkeyに保存する`shared`モードを比較する検証環境です。

```text
k6 -> Traefik -> app (2 replicas) -> Valkey
```

## 必要なツール

- Docker / Docker Compose
- mise
- Go 1.26.4
- k6 2.1.0

Goとk6は`mise.toml`でバージョンを管理しています。

```bash
mise install
```

## shared counterを確認する

`shared`モードでは、2つのapp replicaがValkey上の同じカウンタを更新します。

```bash
RATE_LIMIT_MODE=shared docker compose up -d --build
docker compose ps
```

すべてのコンテナが起動し、`app`の2 replicasと`valkey`がhealthyになったら、ローカルのk6を実行します。

```bash
k6 run -e RATE_LIMIT_MODE=shared k6/rate-limit.js
```

既定では250リクエストを送信し、サービス全体で100件を許可します。

```text
allowed_requests:  100
rejected_requests: 150
```

## local counterを確認する

`local`モードでは、それぞれのapp replicaが独立したカウンタを持ちます。モードを切り替えるため、appコンテナを再作成します。

```bash
RATE_LIMIT_MODE=local docker compose up -d --force-recreate app
k6 run -e RATE_LIMIT_MODE=local k6/rate-limit.js
```

各replicaが100件ずつ許可するため、サービス全体では200件が許可されます。

```text
allowed_requests:  200
rejected_requests: 50
```

`mise.toml`の環境変数では`RATE_LIMIT_MODE=local`を設定しています。実行時の取り違えを防ぐため、上記の例のようにCompose側とk6側のモードを明示してください。異なる値を指定すると、アプリケーションの動作とk6のthresholdが一致せず、テストが失敗します。

## 検証条件を変更する

次の例では、上限を50件、windowを120秒、総リクエスト数を150件に変更します。アプリケーションとk6へ同じ値を渡してください。

```bash
RATE_LIMIT_MODE=shared \
RATE_LIMIT_MAX=50 \
RATE_LIMIT_WINDOW_SECONDS=120 \
docker compose up -d --force-recreate app

k6 run \
  -e RATE_LIMIT_MODE=shared \
  -e RATE_LIMIT_MAX=50 \
  -e RATE_LIMIT_WINDOW_SECONDS=120 \
  -e TOTAL_REQUESTS=150 \
  k6/rate-limit.js
```

利用できる設定は次のとおりです。

| 設定 | 既定値 | 用途 |
| --- | ---: | --- |
| `RATE_LIMIT_MODE` | `local` | `local`または`shared` |
| `RATE_LIMIT_MAX` | `100` | 1 windowで許可するリクエスト数 |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | windowの秒数 |
| `TOTAL_REQUESTS` | `250` | k6が送信する総リクエスト数 |
| `EXPECTED_INSTANCES` | `2` | k6がlocalモードの期待値計算に使うreplica数 |
| `BASE_URL` | `http://localhost` | k6の送信先 |
| `API_KEY` | 実行ごとに自動生成 | リクエストに設定するAPI key |

`app`の`deploy.replicas`を変更した場合は、k6の`EXPECTED_INSTANCES`にも同じ値を指定します。

## 動作確認とログ

単発のHTTPリクエストを送信する場合は、`X-API-Key`を指定します。

```bash
curl -i -H 'X-API-Key: test-key-a' http://localhost/
```

レスポンスを処理したreplicaは`X-Instance-ID`ヘッダーで確認できます。

```bash
docker compose logs -f app
```

Valkeyのカウンタを確認する場合は、次のタスクでCLIを起動できます。

```bash
mise run valkey:shell
```

## 停止する

コンテナを停止する場合は次を実行します。

```bash
docker compose stop
```

コンテナとCompose networkを削除する場合は次を実行します。この検証環境ではValkeyに永続volumeを設定していないため、保存されたカウンタも破棄されます。

```bash
docker compose down
```
