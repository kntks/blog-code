
## 環境構築メモ
```
$ npm i express
$ npm i -D typescript @types/node ts-node @types/express
$ npx tsc --init

$ npm i -D nodaemon
$ touch nodemon.json

$ npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier prettier
```

## 使い方
起動
```
$ npm start
```

format
```
$ npm run fmt
```

リクエスト
```
$ for i in {1..10}; do curl -X POST http://localhost:3000 -d "id=${i}"; echo ;  done 
```

```
$ curl -X POST http://localhost:3000 -d "id=1"
{"response":"1"}                 
```


## メモ

@types/node
https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node


```ts
/**
  * Stops the server from accepting new connections and keeps existing
  * connections. This function is asynchronous, the server is finally closed
  * when all connections are ended and the server emits a `'close'` event.
  * The optional `callback` will be called once the `'close'` event occurs. Unlike
  * that event, it will be called with an `Error` as its only argument if the server
  * was not open when it was closed.
  * @since v0.1.90
  * @param callback Called when the server is closed.
  */
close(callback?: (err?: Error) => void): this;
```
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/net.d.ts#L521-L531

実装はこちら
https://github.com/nodejs/node/blob/c311dc43cd2579ecb3c9f86a802899e6aa163dae/lib/net.js#L2147-L2184


@types/express
https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express

## 型定義

`process.on()`の引数に渡せるシグナル
```ts
type Signals =
  | 'SIGABRT'
  | 'SIGALRM'
  | 'SIGBUS'
  | 'SIGCHLD'
  | 'SIGCONT'
  | 'SIGFPE'
  | 'SIGHUP'
  | 'SIGILL'
  | 'SIGINT'
  | 'SIGIO'
  | 'SIGIOT'
  | 'SIGKILL'
  | 'SIGPIPE'
  | 'SIGPOLL'
  | 'SIGPROF'
  | 'SIGPWR'
  | 'SIGQUIT'
  | 'SIGSEGV'
  | 'SIGSTKFLT'
  | 'SIGSTOP'
  | 'SIGSYS'
  | 'SIGTERM'
  | 'SIGTRAP'
  | 'SIGTSTP'
  | 'SIGTTIN'
  | 'SIGTTOU'
  | 'SIGUNUSED'
  | 'SIGURG'
  | 'SIGUSR1'
  | 'SIGUSR2'
  | 'SIGVTALRM'
  | 'SIGWINCH'
  | 'SIGXCPU'
  | 'SIGXFSZ'
  | 'SIGBREAK'
  | 'SIGLOST'
  | 'SIGINFO';
```
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/process.d.ts#L53-L90


## 参考

- [ExpressとTypeScriptの環境構築 - Zenn](https://zenn.dev/chida/articles/882d9fb1d71fa1)
- [Nodemonを使用してNode.jsアプリケーションを自動的に再起動する方法 - digitalocean](https://www.digitalocean.com/community/tutorials/workflow-nodemon-ja)
- [Express (Node.js) の Graceful shutdown - Qiita](https://qiita.com/megmogmog1965/items/86da1dcb42cb5c6a4d14)