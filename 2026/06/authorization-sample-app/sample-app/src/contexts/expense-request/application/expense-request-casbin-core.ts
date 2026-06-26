import { type Enforcer } from "casbin";

import type { ExpenseRequest } from "@/contexts/expense-request/domain/expense-request";
import type { Actor } from "@/contexts/identity/domain/identity";

import type {
  AuthorizeExpenseRequestInput,
  ExpenseRequestAction,
} from "./expense-request-authorization";

export const expenseRequestCasbinModelText = `
[request_definition]
r = sub, act, obj

[policy_definition]
p = role, act, eft

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = r.sub.role == p.role && r.act == p.act && canAuthorizeExpenseRequest(r.sub, r.act, r.obj)
`;

const resourceRequiredActions = new Set<ExpenseRequestAction>([
  "view",
  "viewReceipt",
  "edit",
  "submit",
  "withdraw",
  "delete",
  "approve",
  "reject",
]);

function canCreateExpenseRequest(actor: Actor) {
  return (
    actor.role === "member" ||
    actor.role === "manager" ||
    actor.role === "admin"
  );
}

function canViewExpenseRequest(actor: Actor, expenseRequest: ExpenseRequest) {
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

function canEditExpenseRequest(actor: Actor, expenseRequest: ExpenseRequest) {
  return expenseRequest.applicantId === actor.identityUserId;
}

function canSubmitExpenseRequest(actor: Actor, expenseRequest: ExpenseRequest) {
  return expenseRequest.applicantId === actor.identityUserId;
}

function canWithdrawExpenseRequest(
  actor: Actor,
  expenseRequest: ExpenseRequest,
) {
  return expenseRequest.applicantId === actor.identityUserId;
}

function canDeleteExpenseRequest(actor: Actor, expenseRequest: ExpenseRequest) {
  return expenseRequest.applicantId === actor.identityUserId;
}

function canApproveExpenseRequest(
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

function canRejectExpenseRequest(actor: Actor, expenseRequest: ExpenseRequest) {
  return canApproveExpenseRequest(actor, expenseRequest);
}

function canInvalidateExpenseRequest(actor: Actor) {
  return actor.role === "admin";
}

function canSettleExpenseRequest(actor: Actor) {
  return actor.role === "admin";
}

function canAuthorizeExpenseRequest(
  actor: Actor,
  action: ExpenseRequestAction,
  expenseRequest: ExpenseRequest | null,
): boolean {
  switch (action) {
    case "create":
      return canCreateExpenseRequest(actor);
    case "view":
    case "viewReceipt":
      return expenseRequest
        ? canViewExpenseRequest(actor, expenseRequest)
        : false;
    case "edit":
      return expenseRequest
        ? canEditExpenseRequest(actor, expenseRequest)
        : false;
    case "submit":
      return expenseRequest
        ? canSubmitExpenseRequest(actor, expenseRequest)
        : false;
    case "withdraw":
      return expenseRequest
        ? canWithdrawExpenseRequest(actor, expenseRequest)
        : false;
    case "delete":
      return expenseRequest
        ? canDeleteExpenseRequest(actor, expenseRequest)
        : false;
    case "approve":
      return expenseRequest
        ? canApproveExpenseRequest(actor, expenseRequest)
        : false;
    case "reject":
      return expenseRequest
        ? canRejectExpenseRequest(actor, expenseRequest)
        : false;
    case "invalidate":
      return canInvalidateExpenseRequest(actor);
    case "settle":
      return canSettleExpenseRequest(actor);
  }
  return false;
}

export function configureExpenseRequestCasbinEnforcer(enforcer: Enforcer) {
  enforcer.addFunction(
    "canAuthorizeExpenseRequest",
    canAuthorizeExpenseRequest,
  );

  return enforcer;
}

export function assertExpenseRequestResourceIfRequired({
  action,
  expenseRequest,
}: Pick<AuthorizeExpenseRequestInput, "action" | "expenseRequest">) {
  if (!resourceRequiredActions.has(action)) {
    return;
  }

  if (!expenseRequest) {
    throw new Error(
      `Expense request is required for "${action}" authorization.`,
    );
  }
}
