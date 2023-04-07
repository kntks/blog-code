# 環境構築

```
$ npm install

$ npm run fmt
```

`direnv`を使っています。

.env
```
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_SESSION_TOKEN=""
```

実行
```
$ npx ts-node src/main.ts
[
  ...
  {
    Path: '/service-role/',
    RoleName: 'test-role1',
    RoleId: 'xxxxx',
    Arn: 'arn:aws:iam::xxxxxx:role/service-role/test-role1',
    CreateDate: 2020-12-23T07:53:59.000Z,
    AssumeRolePolicyDocument: '%7B%22Version%22%3A%222012-10-17%22%2C%22Statement%22%3A%5B%7B%22Effect%22%3A%22Allow%22%2C%22Principal%22%3A%7B%22Service%22%3A%22chatbot.amazonaws.com%22%7D%2C%22Action%22%3A%22sts%3AAssumeRole%22%7D%5D%7D',
    Description: 'AWS Chatbot Execution Role',
    MaxSessionDuration: 3600
  },
  ...
]

```

## インストール メモ

```
$ npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier prettier
```

参考:

[Paginators - AWS SDK for JavaScriptAPI リファレンスガイド](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html#paginators)