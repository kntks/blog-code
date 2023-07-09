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
(.venv) github-actions-workflow-log $ deactivate
```

## code format

```
$ black src/
```


pagination
```

```
https://docs.github.com/en/rest/guides/using-pagination-in-the-rest-api?apiVersion=2022-11-28

```python
import re

link = '<https://api.github.com/repositories/15111821/actions/workflows?page=2>; rel="next", <https://api.github.com/repositories/15111821/actions/workflows?page=2>; rel="last"'
m = re.findall('<(https://.+)>; rel="next"', link)
if len(m) >= 1:
    print("next link =", m[0])
```