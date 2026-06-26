import type { ExpenseRequest } from "@/contexts/expense-request/domain/expense-request";
import type { Actor } from "@/contexts/identity/domain/identity";

export const expenseRequestActions = [
  "create",
  "view",
  "viewReceipt",
  "edit",
  "submit",
  "withdraw",
  "delete",
  "approve",
  "reject",
  "invalidate",
  "settle",
] as const;

export type ExpenseRequestAction = (typeof expenseRequestActions)[number];

export type AuthorizeExpenseRequestInput = {
  actor: Actor;
  action: ExpenseRequestAction;
  expenseRequest?: ExpenseRequest;
};

export interface ExpenseRequestAuthorization {
  authorize(input: AuthorizeExpenseRequestInput): Promise<boolean>;
}
