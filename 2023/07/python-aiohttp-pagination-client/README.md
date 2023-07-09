## 環境構築
```sh
$ python3 -m venv .venv
```

## 仮想環境

### 作成
```sh
$ source ./.venv/bin/activate
```

### 削除
```
(.venv) python-aiohttp-pagination-client $ deactivate
```

## code format

```
$ black src/ tests/
```

## test

```
$ python -m pytest tests -s
```