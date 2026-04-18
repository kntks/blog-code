"use client";

import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";

const providerId = "keycloak";

export default function Home() {
  const session = authClient.useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const user = session.data?.user;
  const sessionData = session.data?.session;

  const handleSignIn = async () => {
    setErrorMessage(null);
    setIsSigningIn(true);

    try {
      const { data, error } = await authClient.signIn.oauth2({
        providerId,
        callbackURL: window.location.origin,
        disableRedirect: true,
      });

      if (error) {
        setErrorMessage(error.message ?? "ログインに失敗しました。");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      setErrorMessage("ログイン用のURLを取得できませんでした。");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMessage(null);
    setIsSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setErrorMessage(error.message ?? "ログアウトに失敗しました。");
        return;
      }

      await session.refetch();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-neutral-950">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            Keycloak Login
          </p>
          <h1 className="text-3xl font-semibold">Better Auth + Keycloak</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            ログインしてユーザー情報を確認し、必要に応じてログアウトできます。
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-900">
          {session.isPending ? (
            <p className="text-sm text-neutral-500">セッションを確認中...</p>
          ) : user ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">ログイン中のユーザー</p>
                <p className="text-xl font-semibold">{user.name || "名無し"}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4 dark:bg-neutral-950">
                  <dt className="text-neutral-500">User ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs">{user.id}</dd>
                </div>
                <div className="rounded-xl bg-white p-4 dark:bg-neutral-950">
                  <dt className="text-neutral-500">Session ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs">{sessionData?.id}</dd>
                </div>
                <div className="rounded-xl bg-white p-4 dark:bg-neutral-950">
                  <dt className="text-neutral-500">有効期限</dt>
                  <dd className="mt-1 text-sm">
                    {sessionData?.expiresAt
                      ? new Date(sessionData.expiresAt).toLocaleString("ja-JP")
                      : "-"}
                  </dd>
                </div>
                <div className="rounded-xl bg-white p-4 dark:bg-neutral-950">
                  <dt className="text-neutral-500">更新日時</dt>
                  <dd className="mt-1 text-sm">
                    {sessionData?.updatedAt
                      ? new Date(sessionData.updatedAt).toLocaleString("ja-JP")
                      : "-"}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                {isSigningOut ? "ログアウト中..." : "ログアウト"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">まだログインしていません。</p>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                {isSigningIn ? "ログイン中..." : "Keycloakでログイン"}
              </button>
            </div>
          )}
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}
