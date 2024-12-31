import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { NextResponse } from "next/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Keycloak],
  callbacks: {
    authorized: async ({ request, auth }) => {
      if (request.nextUrl.pathname === "/") return true;
      if (!auth) {
        return NextResponse.redirect(new URL("/", request.nextUrl.origin));
      }
      return true;
    },
  },
});
