import { ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CLIENT_ID, client, MY_USERNAME_B } from "../cognito.client";

async function resendConfirmationCode() {
  const command = new ResendConfirmationCodeCommand({
    ClientId: CLIENT_ID,
    Username: MY_USERNAME_B,
  });

  const response = await client.send(command);
  console.log(response);
}

resendConfirmationCode().catch(console.error);
