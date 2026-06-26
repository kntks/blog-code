import Link from "next/link";

import { ExpenseRequestForm } from "@/shared/ui/expense-request-form";

import { createExpenseRequestAction } from "../actions";

export default function NewExpenseRequestPage() {
  return (
    <main className="page-stack mx-auto max-w-3xl">
      <div className="page-header">
        <Link href="/expense-requests" className="button-link w-fit text-sm">
          ← 一覧へ戻る
        </Link>
        <h1 className="page-title">新規経費申請</h1>
        <p className="page-copy">
          申請の作成は `new` ページから行い、保存後は詳細ページへ遷移します。
        </p>
      </div>

      <section className="surface-card section-inset">
        <ExpenseRequestForm
          action={createExpenseRequestAction}
          submitLabel="確認画面に進む"
        />
      </section>
    </main>
  );
}
