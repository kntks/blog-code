import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { parseExpenseRequestPublicId } from "@/contexts/expense-request/application/expense-request-command";
import {
  ExpenseRequestAuthorizationError,
  getExpenseRequest,
  getExpenseRequestCapabilities,
} from "@/contexts/expense-request/application/expense-request-service";
import {
  expenseRequestCategoryLabels,
  expenseRequestStatusLabels,
} from "@/contexts/expense-request/domain/expense-request";
import { getAuthenticatedActor } from "@/contexts/identity/application/identity-service";
import { formatDateTime } from "@/shared/lib/date";
import { getSingleSearchParam } from "@/shared/lib/flash-message";
import { FlashMessage } from "@/shared/ui/flash-message";

import {
  approveExpenseRequestAction,
  deleteExpenseRequestAction,
  invalidateExpenseRequestAction,
  rejectExpenseRequestAction,
  settleExpenseRequestAction,
  submitExpenseRequestAction,
  withdrawExpenseRequestAction,
} from "./actions";

const statusBadgeClassNames = {
  draft: "pill-badge pill-badge-neutral",
  submitted: "pill-badge pill-badge-blue",
  approved: "pill-badge pill-badge-success",
  withdrawn: "pill-badge pill-badge-warning",
  settled: "pill-badge pill-badge-success",
  invalidated: "pill-badge pill-badge-danger",
};

type ExpenseRequestDetailPageProps = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExpenseRequestDetailPage({
  params,
  searchParams,
}: ExpenseRequestDetailPageProps) {
  const [{ requestId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const expenseRequestPublicId = parseExpenseRequestPublicId(requestId);

  if (expenseRequestPublicId === null) {
    notFound();
  }

  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/login");
  }

  let expenseRequest;

  try {
    expenseRequest = await getExpenseRequest(actor, expenseRequestPublicId);
  } catch (error) {
    if (error instanceof ExpenseRequestAuthorizationError) {
      redirect("/forbidden");
    }

    throw error;
  }

  if (!expenseRequest) {
    notFound();
  }

  const successMessage = getSingleSearchParam(resolvedSearchParams.success);
  const errorMessage = getSingleSearchParam(resolvedSearchParams.error);
  const capabilities = await getExpenseRequestCapabilities(actor, expenseRequest);
  const deleteAction = deleteExpenseRequestAction.bind(null, requestId);
  const submitAction = submitExpenseRequestAction.bind(null, requestId);
  const withdrawAction = withdrawExpenseRequestAction.bind(null, requestId);
  const approveAction = approveExpenseRequestAction.bind(null, requestId);
  const rejectAction = rejectExpenseRequestAction.bind(null, requestId);
  const invalidateAction = invalidateExpenseRequestAction.bind(null, requestId);
  const settleAction = settleExpenseRequestAction.bind(null, requestId);

  return (
    <main className="page-stack">
      <div className="page-header">
        <Link href="/expense-requests" className="button-link w-fit text-sm">
          ← 一覧へ戻る
        </Link>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={statusBadgeClassNames[expenseRequest.status]}>
              {expenseRequestStatusLabels[expenseRequest.status]}
            </span>
          </div>
          <h1 className="page-title">{expenseRequest.title}</h1>
          <p className="page-copy">
            更新日時: {formatDateTime(expenseRequest.updatedAt)}
          </p>
        </div>
      </div>

      {successMessage ? (
        <FlashMessage kind="success" message={successMessage} />
      ) : null}
      {errorMessage ? (
        <FlashMessage kind="error" message={errorMessage} />
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card section-inset">
          <h2 className="text-[1.375rem] font-bold tracking-[-0.02em] text-[color:var(--foreground)]">
            申請内容
          </h2>
          <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-[color:var(--text-secondary)]">
                タイトル
              </dt>
              <dd className="mt-1 text-[color:var(--foreground)]">
                {expenseRequest.title}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[color:var(--text-secondary)]">
                ステータス
              </dt>
              <dd className="mt-1">
                <span className={statusBadgeClassNames[expenseRequest.status]}>
                  {expenseRequestStatusLabels[expenseRequest.status]}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[color:var(--text-secondary)]">
                金額
              </dt>
              <dd className="mt-1 text-[color:var(--foreground)]">
                {expenseRequest.currency ?? "JPY"}{" "}
                {expenseRequest.amount.toLocaleString("ja-JP")}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[color:var(--text-secondary)]">
                部署 / 申請者
              </dt>
              <dd className="mt-1 text-[color:var(--foreground)]">
                {expenseRequest.departmentId} / #{expenseRequest.applicantId}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[color:var(--text-secondary)]">
                カテゴリ
              </dt>
              <dd className="mt-1 text-[color:var(--foreground)]">
                {expenseRequest.category
                  ? expenseRequestCategoryLabels[expenseRequest.category]
                  : "未設定"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[color:var(--text-secondary)]">
                支出日
              </dt>
              <dd className="mt-1 text-[color:var(--foreground)]">
                {expenseRequest.occurredOn ?? "未設定"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[color:var(--text-secondary)]">
                作成日時 / 申請日時
              </dt>
              <dd className="mt-1 text-[color:var(--foreground)]">
                {formatDateTime(expenseRequest.createdAt)}
                <span className="mt-1 block text-xs text-[color:var(--text-muted)]">
                  {expenseRequest.submittedAt
                    ? formatDateTime(expenseRequest.submittedAt)
                    : "未申請"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[color:var(--text-secondary)]">
                承認者 / 承認日時
              </dt>
              <dd className="mt-1 text-[color:var(--foreground)]">
                {expenseRequest.approverId
                  ? `#${expenseRequest.approverId}`
                  : "未承認"}
                <span className="mt-1 block text-xs text-[color:var(--text-muted)]">
                  {expenseRequest.approvedAt
                    ? formatDateTime(expenseRequest.approvedAt)
                    : "未承認"}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-[color:var(--text-secondary)]">
                説明
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-[color:var(--foreground)]">
                {expenseRequest.description}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-[color:var(--text-secondary)]">
                領収書URL
              </dt>
              <dd className="mt-1 text-[color:var(--foreground)]">
                {expenseRequest.receiptUrl && capabilities.canViewReceipt ? (
                  <a
                    href={expenseRequest.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-link"
                  >
                    添付を開く
                  </a>
                ) : (
                  "未設定"
                )}
              </dd>
            </div>
          </dl>
        </div>

        <aside className="space-y-6">
          <div className="surface-card section-inset">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
              操作
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {capabilities.canEdit ? (
                <Link
                  href={`/expense-requests/${expenseRequest.publicId}/edit`}
                  className="button-secondary w-full"
                >
                  編集する
                </Link>
              ) : null}
              {capabilities.canSubmit ? (
                <form action={submitAction}>
                  <button type="submit" className="button-primary w-full">
                    申請する
                  </button>
                </form>
              ) : null}
              {capabilities.canWithdraw ? (
                <form action={withdrawAction}>
                  <button type="submit" className="button-warning w-full">
                    取り下げる
                  </button>
                </form>
              ) : null}
              {capabilities.canApprove ? (
                <form action={approveAction}>
                  <button type="submit" className="button-success w-full">
                    承認する
                  </button>
                </form>
              ) : null}
              {capabilities.canReject ? (
                <form action={rejectAction}>
                  <button type="submit" className="button-warning w-full">
                    差し戻す
                  </button>
                </form>
              ) : null}
              {capabilities.canInvalidate ? (
                <form action={invalidateAction}>
                  <button type="submit" className="button-neutral w-full">
                    無効化する
                  </button>
                </form>
              ) : null}
              {capabilities.canSettle ? (
                <form action={settleAction}>
                  <button type="submit" className="button-success w-full">
                    精算済みにする
                  </button>
                </form>
              ) : null}
            </div>
          </div>

          {capabilities.canDelete ? (
            <div className="surface-card-danger section-inset">
              <h2 className="text-lg font-semibold text-[color:var(--danger-text)]">
                削除
              </h2>
              <p className="mt-2 text-sm text-[color:var(--danger-text)]">
                下書きだけ削除できます。削除すると一覧からも詳細画面からも参照できなくなります。
              </p>
              <form action={deleteAction} className="mt-4">
                <button type="submit" className="button-danger">
                  この申請を削除する
                </button>
              </form>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
