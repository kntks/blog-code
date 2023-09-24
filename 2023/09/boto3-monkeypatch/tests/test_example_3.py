import json
import botocore.session
from botocore.stub import Stubber, ANY
import pytest 
from mypy_boto3_iam.client import IAMClient

from src.example import Example

@pytest.fixture
def iam_client() -> tuple[IAMClient, Stubber]:

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

  iam = botocore.session.get_session().create_client('iam')
  stubber = Stubber(iam)

  expected_params = {}
  stubber.add_response("list_roles", json.loads(response), expected_params)

  return iam, stubber


class TestExample():
  
  def test_example(self, monkeypatch, iam_client):
    # ============
    #  Arrange
    # ============
    iam, stubber = iam_client 
    stubber.activate()
    monkeypatch.setattr(Example, "_Example__get_client", lambda _: iam)
  
    # ============
    #  Act
    # ============
    res = Example().get_roles()
    
    # ============
    #  Assert
    # ============
    assert res.get("Roles")[0].get("RoleName") == "TestRole"
    
    # ============
    #  Clearnup
    # ============
    stubber.deactivate()
    