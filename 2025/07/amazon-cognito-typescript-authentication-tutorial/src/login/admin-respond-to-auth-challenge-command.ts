import { AdminRespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CLIENT_ID, client, MY_EMAIL, USER_POOL_ID } from "../cognito.client";

// コマンドライン引数からconfirmationCodeとsessionを取得
const args = process.argv.slice(2);
const confirmationCode = args[0];
const session = args[1];

if (!confirmationCode || !session) {
  console.error(
    "Usage: pnpm respond-to-auth-challenge-command.ts <email-otp> <session>",
  );
  process.exit(1);
}

async function adminRespondToAuthChallenge() {
  const command = new AdminRespondToAuthChallengeCommand({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
    ChallengeName: "EMAIL_OTP",
    Session: session,
    ChallengeResponses: {
      USERNAME: MY_EMAIL, // usernameとして設定した値ではなく、Eメールアドレス
      EMAIL_OTP_CODE: confirmationCode,
    },
  });

  const response = await client.send(command);
  console.log(response);
}

adminRespondToAuthChallenge().catch(console.error);
