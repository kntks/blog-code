from typing import Any, AsyncGenerator
import aiohttp
import asyncio
import re


# github rest api link headers
# https://docs.github.com/en/rest/guides/using-pagination-in-the-rest-api?apiVersion=2022-11-28
def extract_next_url(link: str) -> str | None:
    m = re.findall(r'<(https?://[\w/:%#\$&\?\(\)~\.=\+\-]+)>; rel="next"', link)
    return m[0] if len(m) >= 1 else None


async def get(url: str) -> AsyncGenerator[str, None]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    async with aiohttp.ClientSession() as session:
        next_url: str | None = None
        async with session.get(url, headers=headers) as resp:
            next_url = extract_next_url(resp.headers.get("Link"))
            yield await resp.text()

        while next_url is not None:
            async with session.get(next_url, headers=headers) as resp:
                next_url = extract_next_url(resp.headers.get("Link"))
                yield await resp.text()


async def main():
    url = "https://api.github.com/repos/grafana/grafana/actions/workflows"

    async for resp in get(url):
        print(resp)


if __name__ == "__main__":
    asyncio.run(main())
