import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthenticatedActor } from "@/contexts/identity/application/identity-service";

export default async function DashboardPage() {
  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/login");
  }

  const cards = [
    {
      title: "Expense requests",
      description: "経費申請の一覧・登録・更新・削除を行います。",
      href: "/expense-requests",
      badge: "Workflow",
    },
    {
      title: "Approvals",
      description: "承認待ち申請をレビューし、判断を次の状態へ進めます。",
      href: "/approvals",
      badge: actor.role === "member" ? "Read only" : "Review",
    },
  ];

  return (
    <main className="page-stack">
      <section className="surface-card section-inset space-y-6">
        <div className="page-header">
          <span className="page-eyebrow">dashboard</span>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-copy">
            {actor.name} さんは {actor.role} ロール ({actor.departmentCode})
            としてサインインしています。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-card-muted section-inset">
            <span className="page-eyebrow">role</span>
            <p className="metric-card-value mt-3">{actor.role}</p>
          </div>
          <div className="surface-card-muted section-inset">
            <span className="page-eyebrow">department</span>
            <p className="metric-card-value mt-3">{actor.departmentCode}</p>
          </div>
          <div className="surface-card-muted section-inset">
            <span className="page-eyebrow">status</span>
            <p className="mt-3 text-lg font-semibold text-[color:var(--foreground)]">
              signed in
            </p>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              認証済みセッションで各画面にアクセスできます。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {cards.map((card, index) => (
          <article
            key={card.title}
            className={
              index === 1
                ? "surface-card-muted section-inset"
                : "surface-card section-inset"
            }
          >
            <span className="pill-badge pill-badge-blue">{card.badge}</span>
            <h2 className="mt-4 text-[1.375rem] font-bold tracking-[-0.02em] text-[color:var(--foreground)]">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
              {card.description}
            </p>
            <Link href={card.href} className="button-link mt-5">
              開く
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
