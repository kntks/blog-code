data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    principals {
      type        = "AWS"
      identifiers = [data.aws_caller_identity.current.arn]
      # identifiers = [ "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/*" ]
    }
  }

}

resource "aws_iam_role" "packer" {
  name               = "AssumePackerAMIBuilderRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}


# Amazon EC2 のアクション、リソース、および条件キー
# https://docs.aws.amazon.com/ja_jp/service-authorization/latest/reference/list_amazonec2.html
data "aws_iam_policy_document" "packer" {
  statement {
    # IAM Task or Instance Role
    # https://developer.hashicorp.com/packer/integrations/hashicorp/amazon#iam-task-or-instance-role
    actions = [
      "ec2:AttachVolume",
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:CopyImage",
      "ec2:CreateImage",
      "ec2:CreateKeyPair",
      "ec2:CreateSecurityGroup",
      "ec2:CreateSnapshot",
      "ec2:CreateTags",
      "ec2:CreateVolume",
      "ec2:DeleteKeyPair",
      "ec2:DeleteSecurityGroup",
      "ec2:DeleteSnapshot",
      "ec2:DeleteVolume",
      "ec2:DeregisterImage",
      "ec2:DescribeImageAttribute",
      "ec2:DescribeImages",
      "ec2:DescribeInstances",
      "ec2:DescribeInstanceStatus",
      "ec2:DescribeRegions",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSnapshots",
      "ec2:DescribeSubnets",
      "ec2:DescribeTags",
      "ec2:DescribeVolumes",
      "ec2:DetachVolume",
      "ec2:GetPasswordData",
      "ec2:ModifyImageAttribute",
      "ec2:ModifyInstanceAttribute",
      "ec2:ModifySnapshotAttribute",
      "ec2:RegisterImage",
      "ec2:RunInstances",
      "ec2:StopInstances",
      "ec2:TerminateInstances"
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "iam:GetInstanceProfile",
      "iam:PassRole"
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "ssm:StartSession",
      "ssm:TerminateSession"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "packer" {
  name   = "PackerEC2InstancePolicy"
  role   = aws_iam_role.packer.id
  policy = data.aws_iam_policy_document.packer.json
}


# key pairを使ってsshするのではなく、ssmを使用できるように権限を付与する
# IAM instance profile for Systems Manager
# https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs#iam-instance-profile-for-systems-manager

# packerの設定で"source"ブロックにあるiam_instance_profileに設定する
# source "amazon-ebs" "ssm-example" {
#   ...
#   ssh_interface        = "session_manager"
#   communicator         = "ssh"
#   iam_instance_profile = "myinstanceprofile"
# }

data "aws_iam_policy" "ssm_managed_instance_core" {
  arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role" "ssm_instance_core" {
  name                = "PackerAMIBuiderRole"
  assume_role_policy  = data.aws_iam_policy_document.instance_assume_role_policy.json
  managed_policy_arns = [data.aws_iam_policy.ssm_managed_instance_core.arn]
}

resource "aws_iam_instance_profile" "ssm_instance_core" {
  name = "PackerAMIBuilderRole"
  role = aws_iam_role.ssm_instance_core.name
}