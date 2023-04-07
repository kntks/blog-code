
# 環境構築
```
$ python3 -m venv venv
$ source ./venv/bin/activate
$ pip install -r requirements.txt

$ touch .env
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
$ python src/__main__.py
```

仮想環境終了
```
$ deactivate
```


# type hint

```py
def list_roles(
        self, *, PathPrefix: str = ..., Marker: str = ..., MaxItems: int = ...
    ) -> ListRolesResponseTypeDef:
```

## ... って何？

Ellipsis は「何らかの値が存在するが省略されている」ことを表す。
[Python3の...（Ellipsisオブジェクト）について](https://qiita.com/yubessy/items/cc1ca4dbc3161f84285e)

https://docs.python.org/ja/3/library/constants.html#Ellipsis

