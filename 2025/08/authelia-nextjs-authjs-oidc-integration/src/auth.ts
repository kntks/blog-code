import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's access token. */
      accessToken: string
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
  }
}

import { JWT } from "next-auth/jwt"
 
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    accessToken?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "authelia",
      name: "Authelia",
      type: "oidc",
      issuer: "http://127.0.0.1:9091",
      checks: ["state"],
      clientId: process.env.AUTHELIA_CLIENT_ID,
      clientSecret: process.env.AUTHELIA_CLIENT_SECRET,
      authorization: { params: { scope: "openid email profile groups" } },
    },
  ],
  callbacks: {
    /**
     * ユーザーが認証されているか確認する
     * @see https://authjs.dev/getting-started/session-management/protecting?framework=express#nextjs-middleware
     */
    async authorized({ auth }) {
      // ユーザーが認証されているか確認するロジックを実装
      return !!auth
    },
    /**
     * @see https://authjs.dev/guides/restricting-user-access
     */
    async signIn({ user, account }) {
      if(!account) return false

        /**
         * userからidを取得できる
         */
        // user: { id: '4d39df76-9c47-45f2-9d5f-ed47a4957821', email: undefined }

        /**
         * accountには "access_token" があるため、ここで Token Introspection を実行する
         */

        // account: {
        //   access_token: 'authelia_at_eiyrW6Vp6IG9oQK0OCLvVbhCMqFebEg44bJDXW1PIaU.3sw35DUOA3dHDlaroOvoKiM0YEsrlEP1-RzMoSpCJ7w',
        //   expires_in: 3599,
        //   id_token: 'eyJh<base64url>...<base64url>',
        //   scope: 'openid email profile groups',
        //   token_type: 'bearer',
        //   expires_at: 1755705138,
        //   provider: 'authelia',
        //   type: 'oidc',
        //   providerAccountId: 'fb3feb7b-273e-4673-9672-d40a5e106fc1'
        // },

      // falseやErrorをthrowする場合、Access Deniedになる
      return true
    },
    async jwt({ token, user, profile, account, trigger }) {
      if(trigger !== "signIn") return token
      if(!account) return token

      token.accessToken = account.access_token
      return token
    },
    async session({ session, token }) {
      if(token.accessToken) session.user.accessToken = token.accessToken
      return session
    }
  }
})
 