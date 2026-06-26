import { headers } from "next/headers";

import { auth } from "./server";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}
