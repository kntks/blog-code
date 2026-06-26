import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { actorRoles } from "@/contexts/identity/domain/identity";

export const actorRoleEnum = pgEnum("actor_role", actorRoles);

export const departmentsTable = pgTable("departments", {
  id: text().primaryKey(),
  code: text().notNull().unique(),
  name: text().notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

export const identityUsersTable = pgTable("identity_users", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  authUserId: text("auth_user_id").unique(),
  email: text().notNull().unique(),
  name: text().notNull(),
  employeeCode: text("employee_code").notNull().unique(),
  role: actorRoleEnum().notNull().default("member"),
  departmentId: text("department_id")
    .notNull()
    .references(() => departmentsTable.id),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});
