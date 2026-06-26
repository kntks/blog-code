import { listPendingApprovalsFromExpenseRequests } from "@/contexts/approval/infrastructure/expense-request-approval-query";
import type { ApprovalQuery } from "./approval-query-port";

const approvalQuery: ApprovalQuery = {
  listPendingApprovals: listPendingApprovalsFromExpenseRequests,
};

export function getApprovalQuery() {
  return approvalQuery;
}
