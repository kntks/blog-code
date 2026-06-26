import { pgEnum } from "drizzle-orm/pg-core";

import { expenseRequestStatuses } from "@/contexts/expense-request/domain/expense-request";

export const expenseRequestStatusEnum = pgEnum(
  "expense_request_status",
  expenseRequestStatuses,
);
