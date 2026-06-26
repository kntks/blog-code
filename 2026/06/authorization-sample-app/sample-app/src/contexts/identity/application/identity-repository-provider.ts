import {
  createDefaultIdentityUser,
  findIdentityUserByAuthUserOrEmail,
  linkIdentityUserToAuthUser,
  listDepartments,
  listIdentityUsers,
} from "@/contexts/identity/infrastructure/identity-repository";
import type {
  IdentityDirectoryQuery,
  IdentityResolverRepository,
} from "./identity-repository-port";

const identityResolverRepository: IdentityResolverRepository = {
  findByAuthUserOrEmail: findIdentityUserByAuthUserOrEmail,
  linkAuthUser: linkIdentityUserToAuthUser,
  createDefaultUser: createDefaultIdentityUser,
};

const identityDirectoryQuery: IdentityDirectoryQuery = {
  listIdentityUsers,
  listDepartments,
};

export function getIdentityResolverRepository() {
  return identityResolverRepository;
}

export function getIdentityDirectoryQuery() {
  return identityDirectoryQuery;
}
