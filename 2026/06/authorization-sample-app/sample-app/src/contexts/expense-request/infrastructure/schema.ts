import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import {
  type ExpenseRequestCategory,
  type ExpenseRequestStatus,
} from "@/contexts/expense-request/domain/expense-request";
import {
  departmentsTable,
  identityUsersTable,
} from "@/contexts/identity/infrastructure/schema";

import { expenseRequestStatusEnum } from "./status-enum";

export const expenseRequestsTable = pgTable(
  "expense_requests",
  {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    publicId: text("public_id").notNull().unique(),
    applicantId: integer("applicant_id")
      .notNull()
      .references(() => identityUsersTable.id),
    departmentId: text("department_id")
      .notNull()
      .references(() => departmentsTable.id),
    title: text().notNull(),
    amount: integer().notNull(),
    currency: text(),
    category: text().$type<ExpenseRequestCategory | null>(),
    description: text().notNull().default(""),
    occurredOn: date("occurred_on", { mode: "string" }),
    receiptUrl: text("receipt_url"),
    status: expenseRequestStatusEnum()
      .$type<ExpenseRequestStatus>()
      .notNull()
      .default("draft"),
    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
      mode: "date",
    }),
    approvedAt: timestamp("approved_at", {
      withTimezone: true,
      mode: "date",
    }),
    approverId: integer("approver_id").references(() => identityUsersTable.id),
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
  },
  (table) => [
    index("expense_requests_public_id_idx").on(table.publicId),
    index("expense_requests_applicant_id_idx").on(table.applicantId),
    index("expense_requests_department_id_idx").on(table.departmentId),
    index("expense_requests_status_idx").on(table.status),
  ],
);

export const casbinRuleTable = pgTable("casbin_rule", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  ptype: varchar({ length: 255 }),
  v0: varchar({ length: 255 }),
  v1: varchar({ length: 255 }),
  v2: varchar({ length: 255 }),
  v3: varchar({ length: 255 }),
  v4: varchar({ length: 255 }),
  v5: varchar({ length: 255 }),
});
