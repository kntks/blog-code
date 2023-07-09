import json

import pytest
from typing import Any
from aiohttp import web
from aiohttp.test_utils import TestServer

from src.main import get


async def handler(request: web.Request) -> web.Response:
    pageNum: str | None = request.query.get("page")
    host = request.url.host
    port = request.url.port

    if pageNum == "2":
        return web.json_response(
            {
                "total_count": 50,
                "workflows": [
                    {
                        "id": 2,
                    }
                ],
            },
            headers={"Link": f'<http://{host}:{port}/?page=3>; rel="next"'},
        )
    if pageNum == "3":
        return web.json_response(
            {
                "total_count": 50,
                "workflows": [
                    {
                        "id": 3,
                    }
                ],
            },
            headers={"Link": f'<http://{host}:{port}/?page=2>; rel="last"'},
        )

    return web.json_response(
        {
            "total_count": 50,
            "workflows": [
                {
                    "id": 1,
                }
            ],
        },
        headers={"Link": f'<http://{host}:{port}/?page=2>; rel="next"'},
    )


@pytest.mark.asyncio
async def test_get(aiohttp_server: Any) -> None:
    app = web.Application()
    app.add_routes([web.get("/", handler)])
    server: TestServer = await aiohttp_server(app)

    gen = get(server.make_url("/"))

    resp = await gen.__anext__()
    assert json.loads(resp)["workflows"][0]["id"] == 1

    resp = await gen.__anext__()
    assert json.loads(resp)["workflows"][0]["id"] == 2

    resp = await gen.__anext__()
    assert json.loads(resp)["workflows"][0]["id"] == 3
