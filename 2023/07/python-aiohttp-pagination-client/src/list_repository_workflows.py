import aiohttp
import asyncio


async def main():
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://api.github.com/repos/grafana/grafana/actions/workflows",
            headers=headers,
        ) as resp:
            # print(resp.status)
            # print(await resp.text())
            # for i in resp.headers.items():
            #   print(i)

            link = resp.headers.get("Link")
            print(link)


if __name__ == "__main__":
    asyncio.run(main())
