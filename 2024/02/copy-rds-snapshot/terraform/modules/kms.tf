resource "aws_kms_key" "snapshot" {
  count                   = var.create_customer_managed_key ? 1 : 0
  description             = "to encrypt the database snapshot"
  deletion_window_in_days = 10
}

resource "aws_kms_alias" "a" {
  count         = var.create_customer_managed_key ? 1 : 0
  name          = "alias/share/db-snapshot"
  target_key_id = aws_kms_key.snapshot[0].key_id
}

resource "aws_kms_key_policy" "this" {
  count  = var.create_customer_managed_key ? 1 : 0
  key_id = aws_kms_key.snapshot[0].id
  policy = data.aws_iam_policy_document.this.json
}


// ref: https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_ShareSnapshot.html#USER_ShareSnapshot.Encrypted
data "aws_iam_policy_document" "this" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions = [
      "kms:Create*",
      "kms:Describe*",
      "kms:Enable*",
      "kms:List*",
      "kms:Put*",
      "kms:Update*",
      "kms:Revoke*",
      "kms:Disable*",
      "kms:Get*",
      "kms:Delete*",
      "kms:ScheduleKeyDeletion",
      "kms:CancelKeyDeletion"
    ]
    resources = ["*"]
  }

  statement {
    principals {
      type        = "AWS"
      identifiers = [
        "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root",
      ]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = ["*"]
  }

  // https://docs.aws.amazon.com/ja_jp/singlesignon/latest/userguide/referencingpermissionsets.html
  // https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_ShareSnapshot.html#USER_ShareSnapshot.Encrypted
  statement {
    principals {
      type = "AWS"
      identifiers = [ 
        "arn:aws:iam::891376977269:root"
      ]
    }
    actions = [ 
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = [ "*" ]
    condition {
      test = "ArnLike"
      variable = "aws:PrincipalArn"
      values = [
        "arn:aws:iam::891376977269:role/aws-reserved/sso.amazonaws.com/ap-northeast-1/AWSReservedSSO_AdministratorAccess_*"
      ]
    }
  }

  statement {
    principals {
      type = "AWS"
      identifiers = [ 
        "arn:aws:iam::891376977269:root"
      ]
    }
    actions = [ 
      "kms:CreateGrant",
      "kms:ListGrants",
      "kms:RevokeGrant"
    ]
    resources = [ "*" ]
    condition {
      test = "Bool"
      variable = "kms:GrantIsForAWSResource"
      values = [ true ]
    }

    condition {
      test = "ArnLike"
      variable = "aws:PrincipalArn"
      values = [
        "arn:aws:iam::891376977269:role/aws-reserved/sso.amazonaws.com/ap-northeast-1/AWSReservedSSO_AdministratorAccess_*"
      ]
    }
  }
}