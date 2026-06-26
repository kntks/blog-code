import Link from "next/link";
import { redirect } from "next/navigation";

import { listPendingApprovals } from "@/contexts/approval/application/approval-service";
import { expenseRequestStatusLabels } from "@/contexts/expense-request/domain/expense-request";
import { getAuthenticatedActor } from "@/contexts/identity/application/identity-service";
import { formatDateTime } from "@/shared/lib/date";

const statusBadgeClassNames = {
  submitted: "pill-badge pill-badge-blue",
  approved: "pill-badge pill-badge-success",
  withdrawn: "pill-badge pill-badge-warning",
  invalidated: "pill-badge pill-badge-danger",
  settled: "pill-badge pill-badge-success",
  draft: "pill-badge pill-badge-neutral",
};

export default async function ApprovalsPage() {
  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/login");
  }

  if (actor.role === "member") {
    redirect("/forbidden");
  }

  const approvals = await listPendingApprovals(actor);

  return (
    <main className="page-stack">
      <div className="page-header">
        <span className="page-eyebrow">review queue</span>
        <h1 className="page-title">Approvals</h1>
        <p className="page-copy">
          {actor.role === "manager"
            ? "担当部署の承認待ち申請を確認できます。"
            : "全部署の承認待ち申請を確認できます。"}
        </p>
      </div>

      {approvals.length === 0 ? (
        <div className="empty-state">承認待ち申請はありません。</div>
      ) : (
        <div className="surface-card section-inset">
          <div className="overflow-x-auto">
            <table className="data-table text-sm">
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th>部署</th>
                  <th>ステータス</th>
                  <th>申請日時</th>
                  <th>詳細</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr key={approval.id}>
                    <td className="table-primary">{approval.title}</td>
                    <td>{approval.departmentId}</td>
                    <td>
                      <span className={statusBadgeClassNames[approval.status]}>
                        {expenseRequestStatusLabels[approval.status]}
                      </span>
                    </td>
                    <td>
                      {approval.submittedAt
                        ? formatDateTime(approval.submittedAt)
                        : "-"}
                    </td>
                    <td>
                      <Link
                        href={`/expense-requests/${approval.publicId}`}
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
        </div>
      )}
    </main>
  );
}
