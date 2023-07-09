import re

link = '<https://api.github.com/repositories/15111821/actions/workflows?page=2>; rel="next", <https://api.github.com/repositories/15111821/actions/workflows?page=2>; rel="last"'


# github rest api link headers
# https://docs.github.com/en/rest/guides/using-pagination-in-the-rest-api?apiVersion=2022-11-28
def extract_next_url(link: str) -> str | None:
    m = re.findall(r'<(https?://[\w/:%#\$&\?\(\)~\.=\+\-]+)>; rel="next"', link)
    return m[0] if len(m) >= 1 else None


print(extract_next_url(link))
