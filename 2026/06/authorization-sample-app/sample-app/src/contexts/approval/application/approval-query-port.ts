import type { ExpenseRequest } from "@/contexts/expense-request/domain/expense-request";
import type { Actor } from "@/contexts/identity/domain/identity";

export interface ApprovalQuery {
  listPendingApprovals(actor: Actor): Promise<ExpenseRequest[]>;
}
