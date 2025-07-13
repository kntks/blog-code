import { AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { client, MY_USERNAME_B, USER_POOL_ID } from "../cognito.client";

async function adminConfirmSignUp() {
  const command = new AdminConfirmSignUpCommand({
    UserPoolId: USER_POOL_ID,
    Username: MY_USERNAME_B,
  });

  const response = await client.send(command);
  console.log(response);
}

adminConfirmSignUp().catch(console.error);
