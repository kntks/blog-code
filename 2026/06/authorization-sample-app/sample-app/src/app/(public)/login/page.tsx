import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/shared/auth/session";
import { SignInButton } from "@/shared/auth/sign-in-button";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="page-stack gap-6">
          <Link href="/" className="button-link w-fit text-sm">
            ← ホームへ戻る
          </Link>
          <div className="page-header">
            <span className="pill-badge pill-badge-blue w-fit">
              Better Auth x Keycloak
            </span>
            <h1 className="page-title">ログイン</h1>
            <p className="page-copy">
              Better Auth 経由で Keycloak
              にリダイレクトし、認証後はダッシュボードへ戻します。
              公開ページは余白を広く取り、操作面だけをカードとして浮かせています。
            </p>
          </div>
        </section>

        <section className="surface-card section-inset space-y-6">
          <div className="space-y-3">
            <p className="page-eyebrow">sign in</p>
            <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
              `myrealm` の Keycloak
              ログインを利用します。認証済みの場合はこの画面を表示せずにダッシュボードへ遷移します。
            </p>
          </div>
          <SignInButton />
        </section>
      </div>
    </main>
  );
}
