from typing import Any
import boto3
from mypy_boto3_iam.client import IAMClient

class Example:
  def __init__(self) -> None:
    self.__client = self.__get_client()
    
  def __get_client(self) -> IAMClient:
    return boto3.client("iam")
    
  def get_roles(self) -> Any:
    return self.__client.list_roles()