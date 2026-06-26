import { asc, eq, or, sql } from "drizzle-orm";

import type {
  Department,
  IdentityUserWithDepartment,
} from "@/contexts/identity/domain/identity";
import { normalizeIdentityEmail } from "@/contexts/identity/domain/identity";
import { db } from "@/shared/db/client";

import { departmentsTable, identityUsersTable } from "./schema";

export async function findIdentityUserByAuthUserOrEmail(
  input: Readonly<{
    authUserId: string;
    email: string;
  }>,
): Promise<IdentityUserWithDepartment | null> {
  const normalizedEmail = normalizeIdentityEmail(input.email);
  const [identityUser] = await db
    .select({
      id: identityUsersTable.id,
      authUserId: identityUsersTable.authUserId,
      email: identityUsersTable.email,
      name: identityUsersTable.name,
      employeeCode: identityUsersTable.employeeCode,
      role: identityUsersTable.role,
      departmentId: identityUsersTable.departmentId,
      createdAt: identityUsersTable.createdAt,
      updatedAt: identityUsersTable.updatedAt,
      departmentCode: departmentsTable.code,
      departmentName: departmentsTable.name,
    })
    .from(identityUsersTable)
    .innerJoin(
      departmentsTable,
      eq(identityUsersTable.departmentId, departmentsTable.id),
    )
    .where(
      or(
        eq(identityUsersTable.authUserId, input.authUserId),
        eq(identityUsersTable.email, normalizedEmail),
      ),
    )
    .limit(1);

  return identityUser ?? null;
}

export async function linkIdentityUserToAuthUser(input: Readonly<{
  id: number;
  authUserId: string;
  name: string;
}>,
): Promise<void> {
  await db
    .update(identityUsersTable)
    .set({
      authUserId: input.authUserId,
      name: input.name,
      updatedAt: new Date(),
    })
    .where(eq(identityUsersTable.id, input.id));
}

async function getNextEmployeeCode() {
  const [result] = await db
    .select({
      maxEmployeeCode: sql<
        string | null
      >`max(${identityUsersTable.employeeCode})`,
    })
    .from(identityUsersTable);
  const currentNumber = result?.maxEmployeeCode
    ? Number.parseInt(result.maxEmployeeCode.slice(1), 10)
    : 0;

  return `E${(currentNumber + 1).toString().padStart(4, "0")}`;
}

export async function createDefaultIdentityUser(input: Readonly<{
  authUserId: string;
  name: string;
  email: string;
}>,
): Promise<IdentityUserWithDepartment> {
  const normalizedEmail = normalizeIdentityEmail(input.email);
  const employeeCode = await getNextEmployeeCode();
  const [createdIdentityUser] = await db
    .insert(identityUsersTable)
    .values({
      authUserId: input.authUserId,
      email: normalizedEmail,
      name: input.name,
      employeeCode,
      role: "member",
      departmentId: "dept-general",
    })
    .returning({
      id: identityUsersTable.id,
      authUserId: identityUsersTable.authUserId,
      email: identityUsersTable.email,
      name: identityUsersTable.name,
      employeeCode: identityUsersTable.employeeCode,
      role: identityUsersTable.role,
      departmentId: identityUsersTable.departmentId,
      createdAt: identityUsersTable.createdAt,
      updatedAt: identityUsersTable.updatedAt,
    });

  if (!createdIdentityUser) {
    throw new Error("Failed to create a default identity user.");
  }

  const [department] = await db
    .select({
      departmentCode: departmentsTable.code,
      departmentName: departmentsTable.name,
    })
    .from(departmentsTable)
    .where(eq(departmentsTable.id, createdIdentityUser.departmentId))
    .limit(1);

  if (!department) {
    throw new Error("Default department was not found.");
  }

  return {
    ...createdIdentityUser,
    departmentCode: department.departmentCode,
    departmentName: department.departmentName,
  };
}

export async function listIdentityUsers(): Promise<
  Array<IdentityUserWithDepartment>
> {
  return db
    .select({
      id: identityUsersTable.id,
      authUserId: identityUsersTable.authUserId,
      email: identityUsersTable.email,
      name: identityUsersTable.name,
      employeeCode: identityUsersTable.employeeCode,
      role: identityUsersTable.role,
      departmentId: identityUsersTable.departmentId,
      createdAt: identityUsersTable.createdAt,
      updatedAt: identityUsersTable.updatedAt,
      departmentCode: departmentsTable.code,
      departmentName: departmentsTable.name,
    })
    .from(identityUsersTable)
    .innerJoin(
      departmentsTable,
      eq(identityUsersTable.departmentId, departmentsTable.id),
    )
    .orderBy(asc(identityUsersTable.id));
}

export async function listDepartments(): Promise<Department[]> {
  return db.select().from(departmentsTable).orderBy(asc(departmentsTable.code));
}
