import type { Actor } from "@/contexts/identity/domain/identity";
import { mayViewPendingApprovals } from "../domain/approval-policy";
import { getApprovalQuery } from "./approval-query-provider";

const approvalQuery = getApprovalQuery();

export async function listPendingApprovals(actor: Actor) {
  if (!mayViewPendingApprovals(actor)) {
    return [];
  }

  return approvalQuery.listPendingApprovals(actor);
}
