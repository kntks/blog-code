import { AdminInitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import {
  CLIENT_ID,
  client,
  MY_EMAIL,
  MY_PASSWORD,
  USER_POOL_ID,
} from "../cognito.client";

async function adminInitiateAuth() {
  const command = new AdminInitiateAuthCommand({
    UserPoolId: USER_POOL_ID, // User Pool IDが必須
    ClientId: CLIENT_ID,
    // AuthFlow: "USER_PASSWORD_AUTH",
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: MY_EMAIL,
      PASSWORD: MY_PASSWORD,
    },
  });

  const response = await client.send(command);
  console.log(response);
}

adminInitiateAuth().catch(console.error);
