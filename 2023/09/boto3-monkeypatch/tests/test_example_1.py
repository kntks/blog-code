import json
import botocore.session
from botocore.stub import Stubber, ANY

from src.example import Example

iam = botocore.session.get_session().create_client('iam')
stubber = Stubber(iam)


response = """
{
  "Roles": [
    {
      "Path": "/",
      "RoleName": "TestRole",
      "RoleId": "AAAABBBCCDDDADAAAAAAA",
      "Arn": "arn:aws:iam::123456789d:role/TestRole",
      "CreateDate": "2021-02-20T23:16:13+00:00",
      "Description": "",
      "MaxSessionDuration": 3600
    }
  ] 
}
"""

expected_params = {}
stubber.add_response("list_roles", json.loads(response), expected_params)

def test_example(monkeypatch):
  stubber.activate()
  monkeypatch.setattr(Example, "_Example__get_client", lambda _: iam)
  
  res = Example().get_roles()
  assert res.get("Roles")[0].get("RoleName") == "TestRole"
  stubber.deactivate()
  