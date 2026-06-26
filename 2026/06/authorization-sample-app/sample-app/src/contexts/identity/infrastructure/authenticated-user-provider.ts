import { getAuthenticatedUser } from "@/shared/auth/session";

export async function fetchAuthenticatedUser() {
  return getAuthenticatedUser();
}
