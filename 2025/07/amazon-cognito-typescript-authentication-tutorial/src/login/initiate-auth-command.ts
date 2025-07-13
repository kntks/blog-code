import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CLIENT_ID, client, MY_EMAIL, MY_PASSWORD } from "../cognito.client";

async function initiateAuth() {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: MY_EMAIL, // usernameとして設定した値ではなく、Eメールアドレスを使用
      PASSWORD: MY_PASSWORD,
    },
  });

  const response = await client.send(command);
  console.log(response);
}

initiateAuth().catch(console.error);
