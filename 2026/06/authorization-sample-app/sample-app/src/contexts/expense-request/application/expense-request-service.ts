import { nanoid } from "nanoid";

import type { Actor } from "@/contexts/identity/domain/identity";

import {
  applyExpenseRequestDraft,
  approveExpenseRequest,
  createDraftExpenseRequest,
  type ExpenseRequestDraftInput,
  type ExpenseRequest,
  ExpenseRequestDomainError,
  invalidateExpenseRequest,
  rejectExpenseRequest,
  settleExpenseRequest,
  submitExpenseRequest,
  withdrawExpenseRequest,
} from "../domain/expense-request";
import type {
  ExpenseRequestAction,
  ExpenseRequestAuthorization,
} from "./expense-request-authorization";
import { getExpenseRequestAuthorization } from "./expense-request-authorization-provider";
import { getExpenseRequestRepository } from "./expense-request-repository-provider";
import type {
  ExpenseRequestRepository,
} from "./expense-request-repository-port";

export class ExpenseRequestAuthorizationError extends Error {}

export type ExpenseRequestCapabilities = {
  canViewReceipt: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canWithdraw: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canInvalidate: boolean;
  canSettle: boolean;
};

export type CreateExpenseRequestCommand = ExpenseRequestDraftInput;

export type UpdateExpenseRequestCommand = {
  publicId: string;
} & ExpenseRequestDraftInput;

const expenseRequestAuthorization: ExpenseRequestAuthorization =
  getExpenseRequestAuthorization();
const expenseRequestRepository: ExpenseRequestRepository =
  getExpenseRequestRepository();

function normalizeDraftInput<T extends ExpenseRequestDraftInput>(input: T): T {
  return {
    ...input,
    currency: input.currency ?? "JPY",
  };
}

async function assertAuthorizedAction(
  actor: Actor,
  action: ExpenseRequestAction,
  message: string,
  expenseRequest?: ExpenseRequest,
) {
  const isAuthorized = await expenseRequestAuthorization.authorize({
    actor,
    action,
    expenseRequest,
  });

  if (!isAuthorized) {
    throw new ExpenseRequestAuthorizationError(message);
  }
}

function assertDraftOnlyDelete(status: string) {
  if (status !== "draft") {
    throw new ExpenseRequestDomainError(
      "削除は下書きの申請に対してのみ実行できます。",
    );
  }
}

async function getExpenseRequestByPublicIdOrThrow(publicId: string) {
  return expenseRequestRepository.findByPublicId(publicId);
}

export async function getExpenseRequest(actor: Actor, publicId: string) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(publicId);

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "view",
    "この申請を閲覧する権限がありません。",
    expenseRequest,
  );

  return expenseRequest;
}

export async function createExpenseRequest(
  actor: Actor,
  command: CreateExpenseRequestCommand,
) {
  await assertAuthorizedAction(
    actor,
    "create",
    "申請を作成する権限がありません。",
  );

  const normalizedCommand = normalizeDraftInput(command);

  return expenseRequestRepository.create(
    createDraftExpenseRequest({
      publicId: nanoid(),
      applicantId: actor.identityUserId,
      departmentId: actor.departmentId,
      draft: normalizedCommand,
    }),
  );
}

export async function updateExpenseRequest(
  actor: Actor,
  command: UpdateExpenseRequestCommand,
) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(
    command.publicId,
  );

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "edit",
    "この申請を編集する権限がありません。",
    expenseRequest,
  );

  const normalizedCommand = normalizeDraftInput(command);

  const updatedExpenseRequest = applyExpenseRequestDraft(
    expenseRequest,
    normalizedCommand,
  );

  return expenseRequestRepository.save(updatedExpenseRequest);
}

export async function submitExpenseRequestByPublicId(
  actor: Actor,
  publicId: string,
) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(publicId);

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "submit",
    "この申請を申請する権限がありません。",
    expenseRequest,
  );

  const updatedExpenseRequest = submitExpenseRequest(
    expenseRequest,
    new Date(),
  );

  return expenseRequestRepository.save(updatedExpenseRequest);
}

export async function withdrawExpenseRequestByPublicId(
  actor: Actor,
  publicId: string,
) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(publicId);

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "withdraw",
    "この申請を取り下げる権限がありません。",
    expenseRequest,
  );

  const updatedExpenseRequest = withdrawExpenseRequest(
    expenseRequest,
    new Date(),
  );

  return expenseRequestRepository.save(updatedExpenseRequest);
}

export async function approveExpenseRequestByPublicId(
  actor: Actor,
  publicId: string,
) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(publicId);

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "approve",
    "この申請を承認する権限がありません。",
    expenseRequest,
  );

  const updatedExpenseRequest = approveExpenseRequest(
    expenseRequest,
    actor,
    new Date(),
  );

  return expenseRequestRepository.save(updatedExpenseRequest);
}

export async function rejectExpenseRequestByPublicId(
  actor: Actor,
  publicId: string,
) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(publicId);

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "reject",
    "この申請を差し戻す権限がありません。",
    expenseRequest,
  );

  const updatedExpenseRequest = rejectExpenseRequest(
    expenseRequest,
    actor,
    new Date(),
  );

  return expenseRequestRepository.save(updatedExpenseRequest);
}

export async function invalidateExpenseRequestByPublicId(
  actor: Actor,
  publicId: string,
) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(publicId);

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "invalidate",
    "この申請を無効化する権限がありません。",
    expenseRequest,
  );

  const updatedExpenseRequest = invalidateExpenseRequest(
    expenseRequest,
    new Date(),
  );

  return expenseRequestRepository.save(updatedExpenseRequest);
}

export async function settleExpenseRequestByPublicId(
  actor: Actor,
  publicId: string,
) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(publicId);

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "settle",
    "この申請を精算済みにする権限がありません。",
    expenseRequest,
  );

  const updatedExpenseRequest = settleExpenseRequest(
    expenseRequest,
    new Date(),
  );

  return expenseRequestRepository.save(updatedExpenseRequest);
}

export async function deleteExpenseRequest(actor: Actor, publicId: string) {
  const expenseRequest = await getExpenseRequestByPublicIdOrThrow(publicId);

  if (!expenseRequest) {
    return null;
  }

  await assertAuthorizedAction(
    actor,
    "delete",
    "この申請を削除する権限がありません。",
    expenseRequest,
  );
  assertDraftOnlyDelete(expenseRequest.status);

  return expenseRequestRepository.remove(expenseRequest.id);
}

export async function getExpenseRequestCapabilities(
  actor: Actor,
  expenseRequest: ExpenseRequest,
): Promise<ExpenseRequestCapabilities> {
  const [
    mayViewReceipt,
    mayEdit,
    maySubmit,
    mayWithdraw,
    mayDelete,
    mayApprove,
    mayReject,
    mayInvalidate,
    maySettle,
  ] = await Promise.all([
    expenseRequestAuthorization.authorize({
      actor,
      action: "viewReceipt",
      expenseRequest,
    }),
    expenseRequestAuthorization.authorize({
      actor,
      action: "edit",
      expenseRequest,
    }),
    expenseRequestAuthorization.authorize({
      actor,
      action: "submit",
      expenseRequest,
    }),
    expenseRequestAuthorization.authorize({
      actor,
      action: "withdraw",
      expenseRequest,
    }),
    expenseRequestAuthorization.authorize({
      actor,
      action: "delete",
      expenseRequest,
    }),
    expenseRequestAuthorization.authorize({
      actor,
      action: "approve",
      expenseRequest,
    }),
    expenseRequestAuthorization.authorize({
      actor,
      action: "reject",
      expenseRequest,
    }),
    expenseRequestAuthorization.authorize({
      actor,
      action: "invalidate",
      expenseRequest,
    }),
    expenseRequestAuthorization.authorize({
      actor,
      action: "settle",
      expenseRequest,
    }),
  ]);

  return {
    canViewReceipt: mayViewReceipt,
    canEdit: mayEdit && expenseRequest.status === "draft",
    canSubmit: maySubmit && expenseRequest.status === "draft",
    canWithdraw: mayWithdraw && expenseRequest.status === "submitted",
    canDelete: mayDelete && expenseRequest.status === "draft",
    canApprove: mayApprove && expenseRequest.status === "submitted",
    canReject: mayReject && expenseRequest.status === "submitted",
    canInvalidate:
      mayInvalidate &&
      ["submitted", "approved", "withdrawn"].includes(expenseRequest.status),
    canSettle: maySettle && expenseRequest.status === "approved",
  };
}
