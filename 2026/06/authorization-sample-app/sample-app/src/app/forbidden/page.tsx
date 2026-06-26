import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <section className="surface-card section-inset flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <span className="pill-badge pill-badge-neutral">403</span>
        <div className="space-y-3">
          <h1 className="page-title">Forbidden</h1>
          <p className="page-copy mx-auto">
            このページにアクセスする権限がありません。認証・認可が入るとこの画面を利用します。
          </p>
        </div>
        <Link href="/" className="button-primary">
          ホームへ戻る
        </Link>
      </section>
    </main>
  );
}
