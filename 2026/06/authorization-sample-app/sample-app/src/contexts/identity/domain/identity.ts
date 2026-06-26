export const actorRoles = ["member", "manager", "admin"] as const;

export type ActorRole = (typeof actorRoles)[number];

export type Department = Readonly<{
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}>;

export type IdentityUser = Readonly<{
  id: number;
  authUserId: string | null;
  email: string;
  name: string;
  employeeCode: string;
  role: ActorRole;
  departmentId: string;
  createdAt: Date;
  updatedAt: Date;
}>;

export type Actor = Readonly<{
  authUserId: string;
  identityUserId: number;
  email: string;
  name: string;
  employeeCode: string;
  role: ActorRole;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
}>;

export type IdentityUserWithDepartment = IdentityUser &
  Readonly<{
    departmentCode: string;
    departmentName: string;
  }>;

export function normalizeIdentityEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isPrivilegedActor(actor: Actor) {
  return actor.role === "manager" || actor.role === "admin";
}

export function toActor(identityUser: IdentityUserWithDepartment): Actor {
  if (!identityUser.authUserId) {
    throw new Error("authUserId is missing on the identity user.");
  }

  return {
    authUserId: identityUser.authUserId,
    identityUserId: identityUser.id,
    email: identityUser.email,
    name: identityUser.name,
    employeeCode: identityUser.employeeCode,
    role: identityUser.role,
    departmentId: identityUser.departmentId,
    departmentCode: identityUser.departmentCode,
    departmentName: identityUser.departmentName,
  };
}

export function linkIdentityUserToAuthUser(
  identityUser: IdentityUserWithDepartment,
  input: Readonly<{ authUserId: string; name: string }>,
): IdentityUserWithDepartment {
  return {
    ...identityUser,
    authUserId: input.authUserId,
    name: input.name,
  };
}
