import { AdminSetUserMFAPreferenceCommand } from "@aws-sdk/client-cognito-identity-provider";
import { client, MY_EMAIL, USER_POOL_ID } from "../cognito.client";

// メモ：SESのIDを設定する必要がある。
// さらにterraformの設定だと以下のようにする必要がある。

// resource "aws_cognito_user_pool" "main" {
//   name = var.user_pool_name
//
//   ↓の部分を追加
//   email_configuration {
//     email_sending_account = "DEVELOPER"
//     source_arn           = aws_ses_email_identity.main.arn
//     from_email_address   = var.ses_email
//   }
//
//   ↓の部分を追加
//   email_mfa_configuration {
//     message = "Your verification code is {####}."
//     subject = "Your verification code"
//   }
//   ...
// }

async function setUserMFAPreference() {
  const command = new AdminSetUserMFAPreferenceCommand({
    UserPoolId: USER_POOL_ID,
    Username: MY_EMAIL, // ユーザー名としてメールアドレスを使用
    // SMSMfaSettings: {
    //   Enabled: true,
    //   PreferredMfa: false,
    // },
    // SoftwareTokenMfaSettings: {
    //   Enabled: false,
    //   PreferredMfa: false,
    // },
    EmailMfaSettings: {
      Enabled: true,
      PreferredMfa: true,
    },
  });

  const response = await client.send(command);
  console.log(response);
}

setUserMFAPreference().catch(console.error);
