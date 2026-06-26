import type { Actor } from "@/contexts/identity/domain/identity";

import { getExpenseRequestQuery } from "./expense-request-repository-provider";
import type { ExpenseRequestQuery } from "./expense-request-repository-port";

const expenseRequestQuery: ExpenseRequestQuery = getExpenseRequestQuery();

export async function listExpenseRequests(actor: Actor) {
  return expenseRequestQuery.listForActor(actor);
}

export async function listApprovalQueue(actor: Actor) {
  return expenseRequestQuery.listPendingApprovals(actor);
}
