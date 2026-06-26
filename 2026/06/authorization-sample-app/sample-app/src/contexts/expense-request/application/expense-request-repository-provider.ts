import {
  createExpenseRequestRecord,
  deleteExpenseRequestRecord,
  findExpenseRequestByPublicId,
  listExpenseRequestRecordsForActor,
  listPendingApprovalRecords,
  saveExpenseRequest,
} from "../infrastructure/expense-request-repository";
import type {
  ExpenseRequestQuery,
  ExpenseRequestRepository,
} from "./expense-request-repository-port";

const expenseRequestRepository: ExpenseRequestRepository = {
  findByPublicId: findExpenseRequestByPublicId,
  create: createExpenseRequestRecord,
  save: saveExpenseRequest,
  remove: deleteExpenseRequestRecord,
};

export function getExpenseRequestRepository() {
  return expenseRequestRepository;
}

const expenseRequestQuery: ExpenseRequestQuery = {
  listForActor: listExpenseRequestRecordsForActor,
  listPendingApprovals: listPendingApprovalRecords,
};

export function getExpenseRequestQuery() {
  return expenseRequestQuery;
}
