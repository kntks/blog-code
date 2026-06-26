import { listApprovalQueue } from "@/contexts/expense-request/application/expense-request-query-service";
import type { Actor } from "@/contexts/identity/domain/identity";

export async function listPendingApprovalsFromExpenseRequests(actor: Actor) {
  return listApprovalQueue(actor);
}
