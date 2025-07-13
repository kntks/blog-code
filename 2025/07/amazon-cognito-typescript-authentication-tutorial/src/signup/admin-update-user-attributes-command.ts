import { AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import { client, MY_EMAIL, USER_POOL_ID } from "../cognito.client";

async function adminUpdateUserAttributes() {
  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: USER_POOL_ID,
    Username: MY_EMAIL, // ユーザー名としてメールアドレスを使用
    UserAttributes: [
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
  });

  const response = await client.send(command);
  console.log(response);
}

adminUpdateUserAttributes().catch(console.error);
