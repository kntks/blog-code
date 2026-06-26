import type { ExpenseRequest } from "@/contexts/expense-request/domain/expense-request";
import type { Actor } from "@/contexts/identity/domain/identity";

import type {
  AuthorizeExpenseRequestInput,
  ExpenseRequestAuthorization,
} from "./expense-request-authorization";

function mayCreateExpenseRequest(actor: Actor) {
  return (
    actor.role === "member" ||
    actor.role === "manager" ||
    actor.role === "admin"
  );
}

function mayViewExpenseRequest(
  actor: Actor,
  expenseRequest: ExpenseRequest,
) {
  if (expenseRequest.applicantId === actor.identityUserId) {
    return true;
  }

  if (actor.role === "admin") {
    return expenseRequest.status !== "draft";
  }

  if (actor.role === "manager") {
    return (
      expenseRequest.departmentId === actor.departmentId &&
      expenseRequest.status !== "draft"
    );
  }

  return false;
}

function mayEditExpenseRequest(
  actor: Actor,
  expenseRequest: ExpenseRequest,
) {
  return expenseRequest.applicantId === actor.identityUserId;
}

function maySubmitExpenseRequest(
  actor: Actor,
  expenseRequest: ExpenseRequest,
) {
  return expenseRequest.applicantId === actor.identityUserId;
}

function mayWithdrawExpenseRequest(
  actor: Actor,
  expenseRequest: ExpenseRequest,
) {
  return expenseRequest.applicantId === actor.identityUserId;
}

function mayDeleteExpenseRequest(
  actor: Actor,
  expenseRequest: ExpenseRequest,
) {
  return expenseRequest.applicantId === actor.identityUserId;
}

function mayApproveExpenseRequest(
  actor: Actor,
  expenseRequest: ExpenseRequest,
) {
  if (actor.role === "admin") {
    return true;
  }

  if (actor.role === "manager") {
    return expenseRequest.departmentId === actor.departmentId;
  }

  return false;
}

function mayRejectExpenseRequest(
  actor: Actor,
  expenseRequest: ExpenseRequest,
) {
  return mayApproveExpenseRequest(actor, expenseRequest);
}

function mayInvalidateExpenseRequest(actor: Actor) {
  return actor.role === "admin";
}

function maySettleExpenseRequest(actor: Actor) {
  return actor.role === "admin";
}

function mayViewReceipt(actor: Actor, expenseRequest: ExpenseRequest) {
  return mayViewExpenseRequest(actor, expenseRequest);
}

export const localExpenseRequestAuthorization: ExpenseRequestAuthorization = {
  authorize: async ({
    actor,
    action,
    expenseRequest,
  }: AuthorizeExpenseRequestInput) => {
    switch (action) {
      case "create":
        return mayCreateExpenseRequest(actor);
      case "invalidate":
        return mayInvalidateExpenseRequest(actor);
      case "settle":
        return maySettleExpenseRequest(actor);
    }

    if (!expenseRequest) {
      throw new Error(`Expense request is required for "${action}" authorization.`);
    }

    switch (action) {
      case "view":
        return mayViewExpenseRequest(actor, expenseRequest);
      case "viewReceipt":
        return mayViewReceipt(actor, expenseRequest);
      case "edit":
        return mayEditExpenseRequest(actor, expenseRequest);
      case "submit":
        return maySubmitExpenseRequest(actor, expenseRequest);
      case "withdraw":
        return mayWithdrawExpenseRequest(actor, expenseRequest);
      case "delete":
        return mayDeleteExpenseRequest(actor, expenseRequest);
      case "approve":
        return mayApproveExpenseRequest(actor, expenseRequest);
      case "reject":
        return mayRejectExpenseRequest(actor, expenseRequest);
    }
  },
};
