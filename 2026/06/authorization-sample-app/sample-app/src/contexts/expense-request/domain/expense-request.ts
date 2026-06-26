import type { Actor } from "@/contexts/identity/domain/identity";

export const expenseRequestStatuses = [
  "draft",
  "submitted",
  "approved",
  "withdrawn",
  "settled",
  "invalidated",
] as const;

export type ExpenseRequestStatus = (typeof expenseRequestStatuses)[number];

export const expenseRequestStatusLabels: Record<ExpenseRequestStatus, string> =
  {
    draft: "下書き",
    submitted: "申請済み",
    approved: "承認済み",
    withdrawn: "取り下げ済み",
    settled: "精算済み",
    invalidated: "無効化",
  };

export const expenseRequestCategories = [
  "travel",
  "meals",
  "supplies",
  "software",
] as const;

export type ExpenseRequestCategory = (typeof expenseRequestCategories)[number];

export const expenseRequestCategoryLabels: Record<
  ExpenseRequestCategory,
  string
> = {
  travel: "交通・出張",
  meals: "会食",
  supplies: "備品",
  software: "ソフトウェア",
};

export type ExpenseRequest = Readonly<{
  id: number;
  publicId: string;
  applicantId: number;
  departmentId: string;
  title: string;
  amount: number;
  currency: string | null;
  category: ExpenseRequestCategory | null;
  description: string;
  occurredOn: string | null;
  receiptUrl: string | null;
  status: ExpenseRequestStatus;
  submittedAt: Date | null;
  approvedAt: Date | null;
  approverId: number | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ExpenseRequestDraftInput = Readonly<{
  title: string;
  amount: number;
  currency: string | null;
  category: ExpenseRequestCategory | null;
  description: string;
  occurredOn: string | null;
  receiptUrl: string | null;
}>;

export type ExpenseRequestUpsertInput = ExpenseRequestDraftInput;

export type CreateDraftExpenseRequestInput = Readonly<{
  publicId: string;
  applicantId: number;
  departmentId: string;
  draft: ExpenseRequestDraftInput;
}>;

export class ExpenseRequestDomainError extends Error {}

export function createDraftExpenseRequest({
  publicId,
  applicantId,
  departmentId,
  draft,
}: CreateDraftExpenseRequestInput): Omit<
  ExpenseRequest,
  "id" | "createdAt" | "updatedAt"
> {
  return {
    publicId,
    applicantId,
    departmentId,
    status: "draft",
    title: draft.title,
    amount: draft.amount,
    currency: draft.currency,
    category: draft.category,
    description: draft.description,
    occurredOn: draft.occurredOn,
    receiptUrl: draft.receiptUrl,
    submittedAt: null,
    approvedAt: null,
    approverId: null,
  };
}

function assertStatus(
  expenseRequest: ExpenseRequest,
  expectedStatuses: ExpenseRequestStatus[],
  actionLabel: string,
) {
  if (expectedStatuses.includes(expenseRequest.status)) {
    return;
  }

  throw new ExpenseRequestDomainError(
    `${actionLabel}は ${expectedStatuses
      .map((status) => expenseRequestStatusLabels[status])
      .join(" / ")} の申請に対してのみ実行できます。`,
  );
}

export function assertExpenseRequestCompleteForSubmission(
  expenseRequest: ExpenseRequest,
) {
  if (!expenseRequest.title.trim()) {
    throw new ExpenseRequestDomainError("タイトルを入力してください。");
  }

  if (expenseRequest.amount < 1) {
    throw new ExpenseRequestDomainError(
      "申請時の金額は 1 以上である必要があります。",
    );
  }

  if (!expenseRequest.description.trim()) {
    throw new ExpenseRequestDomainError("申請時には説明を入力してください。");
  }

  if (expenseRequest.category === null) {
    throw new ExpenseRequestDomainError("申請時にはカテゴリを選択してください。");
  }

  if (expenseRequest.occurredOn === null) {
    throw new ExpenseRequestDomainError("申請時には支出日を入力してください。");
  }
}

export function applyExpenseRequestDraft(
  expenseRequest: ExpenseRequest,
  input: ExpenseRequestUpsertInput,
) {
  assertStatus(expenseRequest, ["draft"], "編集");

  return {
    ...expenseRequest,
    ...input,
  };
}

export function submitExpenseRequest(
  expenseRequest: ExpenseRequest,
  submittedAt: Date,
) {
  assertStatus(expenseRequest, ["draft"], "申請");
  assertExpenseRequestCompleteForSubmission(expenseRequest);

  return {
    ...expenseRequest,
    status: "submitted" as const,
    submittedAt,
    approvedAt: null,
    approverId: null,
  };
}

export function withdrawExpenseRequest(
  expenseRequest: ExpenseRequest,
  updatedAt: Date,
) {
  assertStatus(expenseRequest, ["submitted"], "取り下げ");

  return {
    ...expenseRequest,
    status: "withdrawn" as const,
    updatedAt,
  };
}

export function approveExpenseRequest(
  expenseRequest: ExpenseRequest,
  actor: Actor,
  approvedAt: Date,
) {
  assertStatus(expenseRequest, ["submitted"], "承認");

  if (expenseRequest.applicantId === actor.identityUserId) {
    throw new ExpenseRequestDomainError(
      "申請者本人は自分の申請を承認できません。",
    );
  }

  return {
    ...expenseRequest,
    status: "approved" as const,
    approvedAt,
    approverId: actor.identityUserId,
    updatedAt: approvedAt,
  };
}

export function rejectExpenseRequest(
  expenseRequest: ExpenseRequest,
  actor: Actor,
  updatedAt: Date,
) {
  assertStatus(expenseRequest, ["submitted"], "差し戻し");

  if (expenseRequest.applicantId === actor.identityUserId) {
    throw new ExpenseRequestDomainError(
      "申請者本人は自分の申請を差し戻しできません。",
    );
  }

  return {
    ...expenseRequest,
    status: "draft" as const,
    submittedAt: null,
    approvedAt: null,
    approverId: null,
    updatedAt,
  };
}

export function invalidateExpenseRequest(
  expenseRequest: ExpenseRequest,
  updatedAt: Date,
) {
  assertStatus(
    expenseRequest,
    ["submitted", "approved", "withdrawn"],
    "無効化",
  );

  return {
    ...expenseRequest,
    status: "invalidated" as const,
    updatedAt,
  };
}

export function settleExpenseRequest(
  expenseRequest: ExpenseRequest,
  updatedAt: Date,
) {
  assertStatus(expenseRequest, ["approved"], "精算済み化");

  return {
    ...expenseRequest,
    status: "settled" as const,
    updatedAt,
  };
}
