import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import {
  CLIENT_ID,
  client,
  MY_EMAIL,
  MY_PASSWORD,
  MY_USERNAME_A,
  MY_USERNAME_B,
} from "../cognito.client";

async function signUpUser() {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    // Username: MY_USERNAME_A,
    Username: MY_USERNAME_B,
    Password: MY_PASSWORD,
    UserAttributes: [
      {
        Name: "email",
        Value: MY_EMAIL,
      },
    ],
  });

  const response = await client.send(command);
  console.log(response);
}

signUpUser().catch(console.error);
