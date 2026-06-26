import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { parseExpenseRequestPublicId } from "@/contexts/expense-request/application/expense-request-command";
import {
  ExpenseRequestAuthorizationError,
  getExpenseRequest,
} from "@/contexts/expense-request/application/expense-request-service";
import { getAuthenticatedActor } from "@/contexts/identity/application/identity-service";
import { ExpenseRequestForm } from "@/shared/ui/expense-request-form";

import { updateExpenseRequestAction } from "../actions";

export const dynamic = "force-dynamic";

type EditExpenseRequestPageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function EditExpenseRequestPage({
  params,
}: EditExpenseRequestPageProps) {
  const { requestId } = await params;
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

  const updateAction = updateExpenseRequestAction.bind(null, requestId);

  return (
    <main className="page-stack mx-auto max-w-3xl">
      <div className="page-header">
        <Link
          href={`/expense-requests/${expenseRequest.publicId}`}
          className="button-link w-fit text-sm"
        >
          ← 詳細へ戻る
        </Link>
        <h1 className="page-title">申請を編集</h1>
        <p className="page-copy">
          編集専用ページで入力内容を更新し、保存後は詳細ページへ戻ります。
        </p>
      </div>

      <section className="surface-card section-inset">
        <ExpenseRequestForm
          action={updateAction}
          submitLabel="更新する"
          values={{
            title: expenseRequest.title,
            amount: expenseRequest.amount,
            currency: expenseRequest.currency,
            category: expenseRequest.category,
            description: expenseRequest.description,
            occurredOn: expenseRequest.occurredOn,
            receiptUrl: expenseRequest.receiptUrl,
          }}
        />
      </section>
    </main>
  );
}
