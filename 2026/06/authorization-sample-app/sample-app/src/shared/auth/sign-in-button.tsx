"use client";

import { useState } from "react";

import { authClient } from "./client";

export function SignInButton() {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignIn() {
    setIsPending(true);
    setErrorMessage(null);

    const result = await authClient.signIn.oauth2({
      providerId: "keycloak",
      callbackURL: "/dashboard",
      errorCallbackURL: "/login",
    });

    if (result.error) {
      setErrorMessage(
        result.error.message ?? "ログインを開始できませんでした。",
      );
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isPending}
        className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Keycloak へ接続中..." : "Keycloak でログイン"}
      </button>

      {errorMessage ? (
        <p className="text-sm text-[color:var(--danger-text)]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
