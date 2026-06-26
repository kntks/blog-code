import {
  linkIdentityUserToAuthUser,
  toActor,
  type Actor,
} from "@/contexts/identity/domain/identity";
import { getAuthenticatedUserProvider } from "./authenticated-user-provider";
import {
  getIdentityDirectoryQuery,
  getIdentityResolverRepository,
} from "./identity-repository-provider";

const authenticatedUserProvider = getAuthenticatedUserProvider();
const identityResolverRepository = getIdentityResolverRepository();
const identityDirectoryQuery = getIdentityDirectoryQuery();

export async function getAuthenticatedActor(): Promise<Actor | null> {
  const authenticatedUser = await authenticatedUserProvider.getAuthenticatedUser();

  if (!authenticatedUser) {
    return null;
  }

  const input = {
    authUserId: authenticatedUser.id,
    name: authenticatedUser.name,
    email: authenticatedUser.email,
  };

  const existingIdentityUser =
    await identityResolverRepository.findByAuthUserOrEmail(input);

  if (!existingIdentityUser) {
    return toActor(await identityResolverRepository.createDefaultUser(input));
  }

  if (existingIdentityUser.authUserId === input.authUserId) {
    return toActor(existingIdentityUser);
  }

  await identityResolverRepository.linkAuthUser({
    id: existingIdentityUser.id,
    authUserId: input.authUserId,
    name: input.name,
  });

  return toActor(linkIdentityUserToAuthUser(existingIdentityUser, input));
}

export async function listIdentityUsers() {
  return identityDirectoryQuery.listIdentityUsers();
}

export async function listDepartments() {
  return identityDirectoryQuery.listDepartments();
}
