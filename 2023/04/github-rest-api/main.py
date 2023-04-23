import time
import requests
import jwt
import json

pem = "./rest-api-app-tgfs.2023-04-17.private-key.pem"
app_id = 

with open(pem, "rb") as pem_file:
    signing_key = jwt.jwk_from_pem(pem_file.read())

payload = {
    # Issued at time
    "iat": int(time.time()),
    # JWT expiration time (10 minutes maximum)
    "exp": int(time.time()) + 600,
    # GitHub App's identifier
    "iss": app_id,
}

encoded_jwt = jwt.JWT().encode(payload, signing_key, alg="RS256")

headers = {
    "Authorization": f"Bearer {encoded_jwt}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

installation_id = 
r = requests.post(
    f"https://api.github.com/app/installations/{installation_id}/access_tokens",
    headers=headers,
)

token = r.json().get("token", "")


# for app in r.json():
#     print(f'slug: {app["app_slug"]}, id: {app["id"]}, app_id: {app["app_id"]}')


headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

repo_name = ""
r = requests.get(f"https://api.github.com/repos/kntks/{repo_name}", headers=headers)

print(json.dumps(r.json()))

