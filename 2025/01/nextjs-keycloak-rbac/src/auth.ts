import NextAuth, { type DefaultSession } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { NextResponse } from "next/server";

const KEYCLOAK_ROLE = {
  admin: "admin",
  editor: "editor",
  readOnly: "read-only",
};

const publicPaths = ["/", "/forbidden"];

const pathPermissions: Array<{
  pattern: RegExp;
  roles: string[];
}> = [
  { pattern: /^\/admin(?:\/.*)?$/, roles: [KEYCLOAK_ROLE.admin] },
  {
    pattern: /^\/edit(?:\/.*)?$/,
    roles: [KEYCLOAK_ROLE.admin, KEYCLOAK_ROLE.editor],
  },
  {
    pattern: /^\/home(?:\/.*)?$/,
    roles: [KEYCLOAK_ROLE.admin, KEYCLOAK_ROLE.editor, KEYCLOAK_ROLE.readOnly],
  },
];

function canAccessPath(path: string, userRoles: string[]): boolean {
  const matched = pathPermissions.find(({ pattern }) => pattern.test(path));
  if (!matched) return false;
  return userRoles.some((role) => matched.roles.includes(role));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Keycloak({
      checks: ["pkce", "nonce"],
    }),
  ],
  callbacks: {
    authorized: async ({ request: { nextUrl }, auth }) => {
      if (publicPaths.includes(nextUrl.pathname)) return true;
      if (!auth) return false;
      if (canAccessPath(nextUrl.pathname, auth.user.roles)) return true;
      return NextResponse.redirect(new URL("/forbidden", nextUrl.origin));
    },
    jwt: async ({ token, profile, trigger }) => {
      if (!(trigger === "signIn" && profile)) return token;
      token.roles = profile.resource_access?.myapp?.roles ?? [];
      return token;
    },
    session: async ({ session, token }) => {
      session.user.roles = token.roles;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});

declare module "next-auth" {
  interface Profile {
    resource_access?: {
      myapp?: {
        roles?: string[];
      };
    };
  }
}

import { JWT } from "next-auth/jwt";
declare module "next-auth/jwt" {
  interface JWT {
    roles: string[];
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      roles: string[];
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
}
