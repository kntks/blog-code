resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # NOTE: alias_attributesを設定している場合、username属性は設定できない
  # username_attributes = []

  alias_attributes         = ["email"]
  auto_verified_attributes = ["email", "phone_number"]

  mfa_configuration = "OPTIONAL"


  software_token_mfa_configuration {
    enabled = false
  }

  email_configuration {
    email_sending_account = "DEVELOPER"
    source_arn           = aws_ses_email_identity.main.arn
    from_email_address   = var.ses_email
  }

  email_mfa_configuration {
    message = "Your verification code is {####}."
    subject = "Your verification code"
  }

  sms_configuration {
    external_id    = "main-user-pool-external-id"
    sns_caller_arn = aws_iam_role.cognito_sms_role.arn
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  device_configuration {
    challenge_required_on_new_device      = false
    device_only_remembered_on_user_prompt = false
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "name"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "phone_number"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "preferred_username"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 128
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "given_name"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "family_name"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "main-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  # 認証フロー
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  # トークンの有効期限
  access_token_validity  = 60 # 60分
  id_token_validity      = 60 # 60分
  refresh_token_validity = 5  # 5日

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # OAuth設定
  supported_identity_providers = ["COGNITO"]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
}

# SMS送信用のIAMロール
resource "aws_iam_role" "cognito_sms_role" {
  name = "cognito-sms-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "cognito-idp.amazonaws.com"
        }
      }
    ]
  })
}

# SMS送信用のIAMポリシー
resource "aws_iam_role_policy" "cognito_sms_policy" {
  name = "cognito-sms-policy"
  role = aws_iam_role.cognito_sms_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = "*"
      }
    ]
  })
}

output "user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.main.arn
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.main.id
}

output "user_pool_domain" {
  value = aws_cognito_user_pool.main.domain
}
