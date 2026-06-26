import Link from "next/link";

export default function PublicHomePage() {
  const highlights = [
    {
      title: "Public and authenticated routes",
      description:
        "公開導線と認証後導線を分離し、認可された操作だけを静かに前面へ出します。",
    },
    {
      title: "Expense request lifecycle",
      description:
        "申請作成から承認、差し戻し、精算までの一連の遷移を確認できます。",
    },
    {
      title: "Role-specific surfaces",
      description:
        "経費申請者と承認者で見える画面を切り替え、権限境界を簡潔に確認できます。",
    },
  ];

  return (
    <main className="page-shell flex min-h-screen flex-col justify-center gap-16">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div className="page-stack gap-6">
          <div className="page-header">
            <span className="page-eyebrow">sample app</span>
            <h1 className="page-title hero-title">
              Expense approval flows, designed with less noise.
            </h1>
            <p className="page-copy text-lg">
              公開ルートと認証後ルートを分けた構成で、経費申請・承認画面の
              骨組みを、暖色系のミニマルな表現で確認できます。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="button-primary">
              ログインへ
            </Link>
            <Link href="/dashboard" className="button-secondary">
              ダッシュボードを見る
            </Link>
          </div>
        </div>

        <aside className="surface-card-muted section-inset space-y-4">
          <span className="pill-badge pill-badge-blue">
            Authorization sample
          </span>
          <div className="space-y-2">
            <p className="metric-card-value">3</p>
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              主要コンテキスト
            </p>
            <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
              Expense requests / Approvals / Role-based access
              の責務を分離しつつ、画面間の遷移を軽く保っています。
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {highlights.map((highlight, index) => (
          <article
            key={highlight.title}
            className={
              index === 1
                ? "surface-card-muted section-inset"
                : "surface-card section-inset"
            }
          >
            <span className="page-eyebrow">0{index + 1}</span>
            <h2 className="mt-3 text-[1.375rem] font-bold tracking-[-0.02em] text-[color:var(--foreground)]">
              {highlight.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
              {highlight.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
