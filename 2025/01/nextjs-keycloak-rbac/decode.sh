#!/bin/bash

# ref: https://gist.github.com/angelo-v/e0208a18d455e2e6ea3c40ad637aac53?permalink_comment_id=3920605#gistcomment-3920605

res=$(curl -s \
 -d "client_id=myapp" \
 -d "client_secret=4x4CQCfZXhFoki6uzwBucUYv13sNBZsk" \
 -d "username=myuser" \
 -d "password=myuser" \
 -d "grant_type=password" \
 -d "scope=openid" \
"http://localhost:8080/realms/myrealm/protocol/openid-connect/token")

access_token=$(jq -r '.access_token' <<< $res)
id_token=$(jq -r '.id_token' <<< $res)

echo "decode access_token"
jq -R 'split(".") | select(length > 0) | .[0],.[1] | @base64d | fromjson' <<< $access_token

# echo "decode id_token"
# jq -R 'split(".") | select(length > 0) | .[0],.[1] | @base64d | fromjson' <<< $id_token