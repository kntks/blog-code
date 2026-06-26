import Link from "next/link";
import { redirect } from "next/navigation";

import { listExpenseRequests } from "@/contexts/expense-request/application/expense-request-query-service";
import {
  expenseRequestStatusLabels,
  type ExpenseRequestStatus,
} from "@/contexts/expense-request/domain/expense-request";
import { getAuthenticatedActor } from "@/contexts/identity/application/identity-service";
import { formatDateTime } from "@/shared/lib/date";
import { getSingleSearchParam } from "@/shared/lib/flash-message";
import { FlashMessage } from "@/shared/ui/flash-message";

export const dynamic = "force-dynamic";

type ExpenseRequestsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusBadgeClassNames: Record<ExpenseRequestStatus, string> = {
  draft: "pill-badge pill-badge-neutral",
  submitted: "pill-badge pill-badge-blue",
  approved: "pill-badge pill-badge-success",
  withdrawn: "pill-badge pill-badge-warning",
  settled: "pill-badge pill-badge-success",
  invalidated: "pill-badge pill-badge-danger",
};

export default async function ExpenseRequestsPage({
  searchParams,
}: ExpenseRequestsPageProps) {
  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/login");
  }

  const [expenseRequests, resolvedSearchParams] = await Promise.all([
    listExpenseRequests(actor),
    searchParams,
  ]);

  const successMessage = getSingleSearchParam(resolvedSearchParams.success);
  const errorMessage = getSingleSearchParam(resolvedSearchParams.error);

  return (
    <main className="page-stack">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="page-header">
          <p className="page-eyebrow">expense request</p>
          <h1 className="page-title">Expense requests</h1>
          <p className="page-copy">
            {actor.role === "admin"
              ? "自分の申請と、全部署の Submitted 以降の申請を一覧できます。"
              : actor.role === "manager"
                ? "自分の申請と、担当部署の Submitted 以降の申請を一覧できます。"
                : "自分の申請のみ一覧できます。"}
          </p>
        </div>

        <Link href="/expense-requests/new" className="button-primary">
          新規申請を作成する
        </Link>
      </div>

      {successMessage ? (
        <FlashMessage kind="success" message={successMessage} />
      ) : null}
      {errorMessage ? (
        <FlashMessage kind="error" message={errorMessage} />
      ) : null}

      <section className="surface-card section-inset">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-[1.375rem] font-bold tracking-[-0.02em] text-[color:var(--foreground)]">
              申請一覧
            </h2>
            <p className="text-sm text-[color:var(--text-secondary)]">
              {expenseRequests.length} 件の申請があります。
            </p>
          </div>
        </div>

        {expenseRequests.length === 0 ? (
          <div className="empty-state">
            まだ申請がありません。新規作成ページから最初の申請を作成してください。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table text-sm">
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th>金額</th>
                  <th>ステータス</th>
                  <th>部署</th>
                  <th>作成日時</th>
                  <th>詳細</th>
                </tr>
              </thead>
              <tbody>
                {expenseRequests.map((expenseRequest) => (
                  <tr key={expenseRequest.id}>
                    <td>
                      <div className="table-primary font-medium">
                        {expenseRequest.title}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-[color:var(--text-muted)]">
                        {expenseRequest.description}
                      </div>
                    </td>
                    <td className="text-[color:var(--foreground)]">
                      ¥{expenseRequest.amount.toLocaleString("ja-JP")}
                    </td>
                    <td>
                      <span
                        className={statusBadgeClassNames[expenseRequest.status]}
                      >
                        {expenseRequestStatusLabels[expenseRequest.status]}
                      </span>
                    </td>
                    <td>{expenseRequest.departmentId}</td>
                    <td>{formatDateTime(expenseRequest.createdAt)}</td>
                    <td>
                      <Link
                        href={`/expense-requests/${expenseRequest.publicId}`}
                        className="button-link"
                      >
                        詳細を見る
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
