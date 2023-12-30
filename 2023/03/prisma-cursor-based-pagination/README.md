
## 環境構築
```bash
$ npm init -y
$ npm i -D typescript ts-node @types/node
$ npx tsc --init
$ npm i -D prisma
$ npx prisma init --datasource-provider mysql

$ npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier prettier
```

データモデルを定義する
```ts
model Posts {
  id        Int     @id @default(autoincrement())
  title     String
}
```

dockerを使ってmysqlを立ち上げる
```bash
$ docker compose up -d
```

migration ファイルを作成する
```bash
$ npx prisma migrate dev --name init

$ npx ts-node src/main.ts
```

参考：https://www.prisma.io/docs/getting-started/quickstart
