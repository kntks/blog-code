import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import {
  CLIENT_ID,
  client,
  MY_USERNAME_A,
  MY_USERNAME_B,
} from "../cognito.client";

const args = process.argv.slice(2);
const confirmationCode = args[0];

if (!confirmationCode) {
  console.error("Usage: pnpm confirm-signup-command.ts <confirmation-code>");
  process.exit(1);
}

async function confirmSignUpUser() {
  const command = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    // Username: MY_USERNAME_A,
    Username: MY_USERNAME_B,
    ConfirmationCode: confirmationCode,
    ForceAliasCreation: true,
  });

  const response = await client.send(command);
  console.log(response);
}

confirmSignUpUser().catch(console.error);
