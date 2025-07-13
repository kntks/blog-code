import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

export const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
});

export const USER_POOL_ID = process.env.USER_POOL_ID || "";
export const CLIENT_ID = process.env.CLIENT_ID || "";

export const MY_EMAIL = process.env.MY_EMAIL || "";
export const MY_USERNAME_A = "username-a";
export const MY_USERNAME_B = "username-b";
export const MY_PASSWORD = "Password123!";
