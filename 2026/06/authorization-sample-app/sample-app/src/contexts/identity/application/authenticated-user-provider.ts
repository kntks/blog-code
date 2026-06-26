import { fetchAuthenticatedUser } from "@/contexts/identity/infrastructure/authenticated-user-provider";
import type { AuthenticatedUserProvider } from "./authenticated-user-port";

const authenticatedUserProvider: AuthenticatedUserProvider = {
  getAuthenticatedUser: fetchAuthenticatedUser,
};

export function getAuthenticatedUserProvider() {
  return authenticatedUserProvider;
}
