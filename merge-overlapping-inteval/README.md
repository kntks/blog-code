# 期間の重複をマージする

[Golang, TypeScript】期間の重複をマージする](https://blog.takenoko.dev/posts/2023/02/merge-overlapping-interval/)に書いた記事で使用したコードです。


## typescript

```
$ pwd
path/to/merge-overlapping-inteval/typescript

$ npm ci              

added 19 packages, and audited 20 packages in 692ms

found 0 vulnerabilities

$ npx ts-node index.ts
[
  { start: 2023-01-10T00:00:00.000Z, end: 2023-01-10T13:00:00.000Z },
  { start: 2023-01-10T18:00:00.000Z, end: 2023-01-10T20:00:00.000Z }
]
```

## golang
```
$ pwd
path/to/merge-overlapping-inteval/golang

$ go version    
go version go1.19 darwin/arm64

$ go run main.go
{2023-01-10 00:00:00 +0900 Asia/Tokyo 2023-01-10 13:00:00 +0900 Asia/Tokyo}
{2023-01-10 18:00:00 +0900 Asia/Tokyo 2023-01-10 20:00:00 +0900 Asia/Tokyo}

$ go test ./... 
ok      interval        0.317s
```