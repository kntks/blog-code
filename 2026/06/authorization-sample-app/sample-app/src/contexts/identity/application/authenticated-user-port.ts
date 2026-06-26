export type AuthenticatedUser = Readonly<{
  id: string;
  name: string;
  email: string;
}>;

export interface AuthenticatedUserProvider {
  getAuthenticatedUser(): Promise<AuthenticatedUser | null>;
}
