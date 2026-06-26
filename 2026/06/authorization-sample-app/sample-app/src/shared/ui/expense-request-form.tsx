"use client";

import { useActionState } from "react";

import type {
  ExpenseRequestFormState,
  ExpenseRequestFormValues,
} from "@/contexts/expense-request/application/expense-request-command";
import {
  expenseRequestCategories,
  expenseRequestCategoryLabels,
} from "@/contexts/expense-request/domain/expense-request";
import { FlashMessage } from "@/shared/ui/flash-message";

type ExpenseRequestFormProps = {
  action: (
    state: ExpenseRequestFormState,
    formData: FormData,
  ) => ExpenseRequestFormState | Promise<ExpenseRequestFormState>;
  submitLabel: string;
  values?: ExpenseRequestFormValues;
  submitButtonClassName?: string;
};

export function ExpenseRequestForm({
  action,
  submitLabel,
  values,
  submitButtonClassName,
}: ExpenseRequestFormProps) {
  const initialState: ExpenseRequestFormState = {
    errorMessage: null,
    values: values ?? {},
  };
  const [state, formAction, isPending] = useActionState(action, initialState);
  const currentValues = state.values;
  const fieldClassName =
    "w-full rounded-[4px] border border-[color:var(--border-whisper)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent-blue)] focus:shadow-[0_0_0_3px_rgba(9,127,232,0.12)]";

  return (
    <form action={formAction} className="space-y-4">
      {state.errorMessage ? (
        <FlashMessage kind="error" message={state.errorMessage} />
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-[color:var(--foreground)]"
        >
          タイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          defaultValue={currentValues.title ?? ""}
          className={fieldClassName}
          placeholder="例: 大阪出張の交通費"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-[color:var(--foreground)]"
          >
            金額
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required
            defaultValue={currentValues.amount?.toString() ?? ""}
            className={fieldClassName}
            placeholder="例: 12800"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-[color:var(--foreground)]"
          >
            通貨コード
          </label>
          <input
            id="currency"
            name="currency"
            type="text"
            maxLength={3}
            defaultValue={currentValues.currency ?? "JPY"}
            className={`${fieldClassName} uppercase`}
            placeholder="JPY"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-[color:var(--foreground)]"
          >
            カテゴリ
          </label>
          <select
            id="category"
            name="category"
            defaultValue={currentValues.category ?? ""}
            className={fieldClassName}
          >
            <option value="">選択してください</option>
            {expenseRequestCategories.map((category) => (
              <option key={category} value={category}>
                {expenseRequestCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="occurredOn"
            className="block text-sm font-medium text-[color:var(--foreground)]"
          >
            支出日
          </label>
          <input
            id="occurredOn"
            name="occurredOn"
            type="date"
            defaultValue={currentValues.occurredOn ?? ""}
            className={fieldClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="receiptUrl"
          className="block text-sm font-medium text-[color:var(--foreground)]"
        >
          領収書 URL
        </label>
        <input
          id="receiptUrl"
          name="receiptUrl"
          type="url"
          defaultValue={currentValues.receiptUrl ?? ""}
          className={fieldClassName}
          placeholder="https://example.com/receipt.pdf"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-[color:var(--foreground)]"
        >
          説明
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={2000}
          rows={5}
          defaultValue={currentValues.description ?? ""}
          className={fieldClassName}
          placeholder="申請理由や利用内容を入力してください。"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={submitButtonClassName ?? "button-primary"}
      >
        {isPending ? "送信中..." : submitLabel}
      </button>
    </form>
  );
}
