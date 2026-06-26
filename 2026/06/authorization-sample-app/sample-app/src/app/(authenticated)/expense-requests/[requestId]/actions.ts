"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ExpenseRequestValidationError,
  createExpenseRequestFormState,
  createUpdateExpenseRequestCommand,
  parseExpenseRequestPublicId,
  readExpenseRequestFormValues,
  type ExpenseRequestFormState,
} from "@/contexts/expense-request/application/expense-request-command";
import {
  approveExpenseRequestByPublicId,
  deleteExpenseRequest,
  ExpenseRequestAuthorizationError,
  invalidateExpenseRequestByPublicId,
  rejectExpenseRequestByPublicId,
  settleExpenseRequestByPublicId,
  submitExpenseRequestByPublicId,
  updateExpenseRequest,
  withdrawExpenseRequestByPublicId,
} from "@/contexts/expense-request/application/expense-request-service";
import { ExpenseRequestDomainError } from "@/contexts/expense-request/domain/expense-request";
import { getAuthenticatedActor } from "@/contexts/identity/application/identity-service";
import { buildPathWithMessage } from "@/shared/lib/flash-message";

function redirectForInvalidId(): never {
  redirect(
    buildPathWithMessage(
      "/expense-requests",
      "error",
      "経費申請を見つけられませんでした。",
    ),
  );
}

function getExpenseRequestPublicIdOrRedirect(requestId: string): string {
  const expenseRequestPublicId = parseExpenseRequestPublicId(requestId);

  if (expenseRequestPublicId === null) {
    redirectForInvalidId();
  }

  return expenseRequestPublicId;
}

function revalidateExpenseRequestPages(requestId: string) {
  revalidatePath("/expense-requests");
  revalidatePath(`/expense-requests/${requestId}`);
  revalidatePath(`/expense-requests/${requestId}/edit`);
  revalidatePath("/approvals");
}

function redirectWithExpenseRequestMessage(
  requestId: string,
  kind: "error" | "success",
  message: string,
): never {
  redirect(
    buildPathWithMessage(`/expense-requests/${requestId}`, kind, message),
  );
}

const errorMessageFallback = "予期しないエラーが発生しました。";

function extractErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return errorMessageFallback;
}

async function getActorOrRedirect() {
  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/login");
  }

  return actor;
}

export async function updateExpenseRequestAction(
  requestId: string,
  _state: ExpenseRequestFormState,
  formData: FormData,
) {
  const expenseRequestPublicId = getExpenseRequestPublicIdOrRedirect(requestId);
  const actor = await getActorOrRedirect();
  let updatedExpenseRequestPublicId: string;

  try {
    const command = createUpdateExpenseRequestCommand(
      expenseRequestPublicId,
      formData,
    );
    const updatedExpenseRequest = await updateExpenseRequest(actor, command);

    if (!updatedExpenseRequest) {
      redirectForInvalidId();
    }
    updatedExpenseRequestPublicId = updatedExpenseRequest.publicId;
  } catch (error) {
    if (
      error instanceof ExpenseRequestValidationError ||
      error instanceof ExpenseRequestDomainError ||
      error instanceof ExpenseRequestAuthorizationError
    ) {
      return createExpenseRequestFormState(
        readExpenseRequestFormValues(formData),
        error.message,
      );
    }

    return createExpenseRequestFormState(
      readExpenseRequestFormValues(formData),
      extractErrorMessage(error),
    );
  }

  revalidateExpenseRequestPages(updatedExpenseRequestPublicId);
  redirectWithExpenseRequestMessage(
    updatedExpenseRequestPublicId,
    "success",
    "経費申請を更新しました。",
  );
}

export async function submitExpenseRequestAction(requestId: string) {
  const expenseRequestPublicId = getExpenseRequestPublicIdOrRedirect(requestId);
  const actor = await getActorOrRedirect();

  try {
    const updatedExpenseRequest = await submitExpenseRequestByPublicId(
      actor,
      expenseRequestPublicId,
    );

    if (!updatedExpenseRequest) {
      redirectForInvalidId();
    }

    revalidateExpenseRequestPages(expenseRequestPublicId);
    redirectWithExpenseRequestMessage(
      expenseRequestPublicId,
      "success",
      "経費申請を申請しました。",
    );
  } catch (error) {
    if (
      error instanceof ExpenseRequestDomainError ||
      error instanceof ExpenseRequestAuthorizationError
    ) {
      redirectWithExpenseRequestMessage(
        expenseRequestPublicId,
        "error",
        error.message,
      );
    }

    throw error;
  }
}

export async function withdrawExpenseRequestAction(requestId: string) {
  const expenseRequestPublicId = getExpenseRequestPublicIdOrRedirect(requestId);
  const actor = await getActorOrRedirect();

  try {
    const updatedExpenseRequest = await withdrawExpenseRequestByPublicId(
      actor,
      expenseRequestPublicId,
    );

    if (!updatedExpenseRequest) {
      redirectForInvalidId();
    }

    revalidateExpenseRequestPages(expenseRequestPublicId);
    redirectWithExpenseRequestMessage(
      expenseRequestPublicId,
      "success",
      "経費申請を取り下げました。",
    );
  } catch (error) {
    if (
      error instanceof ExpenseRequestDomainError ||
      error instanceof ExpenseRequestAuthorizationError
    ) {
      redirectWithExpenseRequestMessage(
        expenseRequestPublicId,
        "error",
        error.message,
      );
    }

    throw error;
  }
}

export async function approveExpenseRequestAction(requestId: string) {
  const expenseRequestPublicId = getExpenseRequestPublicIdOrRedirect(requestId);
  const actor = await getActorOrRedirect();

  try {
    const updatedExpenseRequest = await approveExpenseRequestByPublicId(
      actor,
      expenseRequestPublicId,
    );

    if (!updatedExpenseRequest) {
      redirectForInvalidId();
    }

    revalidateExpenseRequestPages(expenseRequestPublicId);
    redirectWithExpenseRequestMessage(
      expenseRequestPublicId,
      "success",
      "経費申請を承認しました。",
    );
  } catch (error) {
    if (
      error instanceof ExpenseRequestDomainError ||
      error instanceof ExpenseRequestAuthorizationError
    ) {
      redirectWithExpenseRequestMessage(
        expenseRequestPublicId,
        "error",
        error.message,
      );
    }

    throw error;
  }
}

export async function rejectExpenseRequestAction(requestId: string) {
  const expenseRequestPublicId = getExpenseRequestPublicIdOrRedirect(requestId);
  const actor = await getActorOrRedirect();

  try {
    const updatedExpenseRequest = await rejectExpenseRequestByPublicId(
      actor,
      expenseRequestPublicId,
    );

    if (!updatedExpenseRequest) {
      redirectForInvalidId();
    }

    revalidateExpenseRequestPages(expenseRequestPublicId);
    redirectWithExpenseRequestMessage(
      expenseRequestPublicId,
      "success",
      "経費申請を差し戻しました。",
    );
  } catch (error) {
    if (
      error instanceof ExpenseRequestDomainError ||
      error instanceof ExpenseRequestAuthorizationError
    ) {
      redirectWithExpenseRequestMessage(
        expenseRequestPublicId,
        "error",
        error.message,
      );
    }

    throw error;
  }
}

export async function invalidateExpenseRequestAction(requestId: string) {
  const expenseRequestPublicId = getExpenseRequestPublicIdOrRedirect(requestId);
  const actor = await getActorOrRedirect();

  try {
    const updatedExpenseRequest = await invalidateExpenseRequestByPublicId(
      actor,
      expenseRequestPublicId,
    );

    if (!updatedExpenseRequest) {
      redirectForInvalidId();
    }

    revalidateExpenseRequestPages(expenseRequestPublicId);
    redirectWithExpenseRequestMessage(
      expenseRequestPublicId,
      "success",
      "経費申請を無効化しました。",
    );
  } catch (error) {
    if (
      error instanceof ExpenseRequestDomainError ||
      error instanceof ExpenseRequestAuthorizationError
    ) {
      redirectWithExpenseRequestMessage(
        expenseRequestPublicId,
        "error",
        error.message,
      );
    }

    throw error;
  }
}

export async function settleExpenseRequestAction(requestId: string) {
  const expenseRequestPublicId = getExpenseRequestPublicIdOrRedirect(requestId);
  const actor = await getActorOrRedirect();

  try {
    const updatedExpenseRequest = await settleExpenseRequestByPublicId(
      actor,
      expenseRequestPublicId,
    );

    if (!updatedExpenseRequest) {
      redirectForInvalidId();
    }

    revalidateExpenseRequestPages(expenseRequestPublicId);
    redirectWithExpenseRequestMessage(
      expenseRequestPublicId,
      "success",
      "経費申請を精算済みにしました。",
    );
  } catch (error) {
    if (
      error instanceof ExpenseRequestDomainError ||
      error instanceof ExpenseRequestAuthorizationError
    ) {
      redirectWithExpenseRequestMessage(
        expenseRequestPublicId,
        "error",
        error.message,
      );
    }

    throw error;
  }
}

export async function deleteExpenseRequestAction(requestId: string) {
  const expenseRequestPublicId = getExpenseRequestPublicIdOrRedirect(requestId);
  const actor = await getActorOrRedirect();

  try {
    const deletedExpenseRequest = await deleteExpenseRequest(
      actor,
      expenseRequestPublicId,
    );

    if (!deletedExpenseRequest) {
      redirectForInvalidId();
    }

    revalidateExpenseRequestPages(expenseRequestPublicId);
    redirect(
      buildPathWithMessage(
        "/expense-requests",
        "success",
        "経費申請を削除しました。",
      ),
    );
  } catch (error) {
    if (
      error instanceof ExpenseRequestDomainError ||
      error instanceof ExpenseRequestAuthorizationError
    ) {
      redirectWithExpenseRequestMessage(
        expenseRequestPublicId,
        "error",
        error.message,
      );
    }

    throw error;
  }
}
