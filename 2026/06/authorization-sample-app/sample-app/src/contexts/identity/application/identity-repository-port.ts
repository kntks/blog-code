import type {
  Department,
  IdentityUserWithDepartment,
} from "@/contexts/identity/domain/identity";

export type ResolveActorFromAuthUserInput = Readonly<{
  authUserId: string;
  name: string;
  email: string;
}>;

export interface IdentityResolverRepository {
  findByAuthUserOrEmail(
    input: ResolveActorFromAuthUserInput,
  ): Promise<IdentityUserWithDepartment | null>;
  linkAuthUser(input: Readonly<{ id: number; authUserId: string; name: string }>): Promise<void>;
  createDefaultUser(input: ResolveActorFromAuthUserInput): Promise<IdentityUserWithDepartment>;
}

export interface IdentityDirectoryQuery {
  listIdentityUsers(): Promise<IdentityUserWithDepartment[]>;
  listDepartments(): Promise<Department[]>;
}
