"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ExpenseRequestValidationError,
  createExpenseRequestFormState,
  createCreateExpenseRequestCommand,
  readExpenseRequestFormValues,
  type ExpenseRequestFormState,
} from "@/contexts/expense-request/application/expense-request-command";
import {
  createExpenseRequest,
  ExpenseRequestAuthorizationError,
} from "@/contexts/expense-request/application/expense-request-service";
import { ExpenseRequestDomainError } from "@/contexts/expense-request/domain/expense-request";
import { getAuthenticatedActor } from "@/contexts/identity/application/identity-service";
import { buildPathWithMessage } from "@/shared/lib/flash-message";

function revalidateExpenseRequestPages() {
  revalidatePath("/expense-requests");
  revalidatePath("/approvals");
}

const errorMessageFallback = "予期しないエラーが発生しました。";

function extractErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return errorMessageFallback;
}

export async function createExpenseRequestAction(
  _state: ExpenseRequestFormState,
  formData: FormData,
) {
  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/login");
  }

  let createdExpenseRequestPublicId: string;

  try {
    const command = createCreateExpenseRequestCommand(formData);
    const createdExpenseRequest = await createExpenseRequest(actor, command);
    createdExpenseRequestPublicId = createdExpenseRequest.publicId;
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

  revalidateExpenseRequestPages();
  redirect(
    buildPathWithMessage(
      `/expense-requests/${createdExpenseRequestPublicId}`,
      "success",
      "経費申請を下書きとして作成しました。",
    ),
  );
}
