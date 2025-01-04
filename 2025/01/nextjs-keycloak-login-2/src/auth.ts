import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { NextResponse } from "next/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Keycloak({
      checks: ["pkce", "nonce"],
    }),
  ],
  callbacks: {
    authorized: async ({ request, auth }) => {
      if (request.nextUrl.pathname === "/") return true;
      if (!auth) {
        return NextResponse.redirect(new URL("/", request.nextUrl.origin));
      }
      return true;
    },
    jwt: async ({ token, profile, account, trigger }) => {
      if (trigger === "signIn") {
        console.log("profile", profile);
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
    updateAge: 60 * 60, // 1 hour
  },
});
