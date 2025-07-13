import { RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CLIENT_ID, client, MY_EMAIL } from "../cognito.client";

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

async function respondToAuthChallenge() {
  const command = new RespondToAuthChallengeCommand({
    ClientId: CLIENT_ID,
    ChallengeName: "EMAIL_OTP",
    Session: session,
    ChallengeResponses: {
      USERNAME: MY_EMAIL, // usernameとして設定した値ではなく、Eメールアドレスを使用
      EMAIL_OTP_CODE: confirmationCode,
    },
  });

  const response = await client.send(command);
  console.log(response);
}

respondToAuthChallenge().catch(console.error);
