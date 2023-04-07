import boto3
import pprint
from mypy_boto3_iam.client import IAMClient
from mypy_boto3_iam.paginator import ListRolesPaginator

iam_client: IAMClient = boto3.client('iam', region_name='ap-northeast-1')
paginator: ListRolesPaginator = iam_client.get_paginator('list_roles')

def all_roles():
  for res in paginator.paginate():
    for role in res["Roles"]:
      yield role

for x in all_roles():
  pprint.pprint(x)
  # e.g.)
  # 
  # {'Arn': 'arn:aws:iam::xxxxxx:role/service-role/test-role1',
  #  'AssumeRolePolicyDocument': {'Statement': [{'Action': 'sts:AssumeRole',
  #                                              'Effect': 'Allow',
  #                                              'Principal': {'Service': 'chatbot.amazonaws.com'}}],
  #                               'Version': '2012-10-17'},
  #  'CreateDate': datetime.datetime(2020, 12, 23, 7, 53, 59, tzinfo=tzutc()),
  #  'Description': 'AWS Chatbot Execution Role',
  #  'MaxSessionDuration': 3600,
  #  'Path': '/service-role/',
  #  'RoleId': 'xxxxxxxxxxxxx,
  #  'RoleName': 'test-role1'}
  