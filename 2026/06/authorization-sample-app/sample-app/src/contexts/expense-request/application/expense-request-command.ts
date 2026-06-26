import * as v from "valibot";

import type {
  CreateExpenseRequestCommand,
  UpdateExpenseRequestCommand,
} from "@/contexts/expense-request/application/expense-request-service";
import { expenseRequestCategories } from "@/contexts/expense-request/domain/expense-request";

export type ExpenseRequestFormValues = {
  title?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  category?: string | null;
  description?: string | null;
  occurredOn?: string | null;
  receiptUrl?: string | null;
};

export type ExpenseRequestFormState = {
  errorMessage: string | null;
  values: ExpenseRequestFormValues;
};

type ExpenseRequestFormInput = {
  title: string;
  amount: string;
  currency: string | null;
  category: string | null;
  description: string;
  occurredOn: string | null;
  receiptUrl: string | null;
};

export class ExpenseRequestValidationError extends Error {}

const expenseRequestPublicIdSchema = v.pipe(
  v.string("経費申請IDの形式が不正です。"),
  v.trim(),
  v.nonEmpty("経費申請IDの形式が不正です。"),
  v.regex(/^.{21}$/, "経費申請IDの形式が不正です。"),
  v.regex(/^[A-Za-z0-9_-]+$/, "経費申請IDの形式が不正です。"),
);

const forbiddenCreateFieldMessages = {
  publicId: "publicId はクライアントから指定できません。",
  applicantId: "applicantId はクライアントから指定できません。",
  departmentId: "departmentId はクライアントから指定できません。",
  status: "status はクライアントから指定できません。",
  submittedAt: "submittedAt はクライアントから指定できません。",
  approvedAt: "approvedAt はクライアントから指定できません。",
  approverId: "approverId はクライアントから指定できません。",
  createdAt: "createdAt はクライアントから指定できません。",
  updatedAt: "updatedAt はクライアントから指定できません。",
} as const;

const forbiddenUpdateFieldMessages = {
  ...forbiddenCreateFieldMessages,
  publicId: "publicId はクライアントから更新できません。",
  applicantId: "applicantId はクライアントから更新できません。",
  departmentId: "departmentId はクライアントから更新できません。",
  status: "status はクライアントから更新できません。",
  submittedAt: "submittedAt はクライアントから更新できません。",
  approvedAt: "approvedAt はクライアントから更新できません。",
  approverId: "approverId はクライアントから更新できません。",
  createdAt: "createdAt はクライアントから更新できません。",
  updatedAt: "updatedAt はクライアントから更新できません。",
} as const;

function requiredString(label: string, maxLength: number) {
  return v.pipe(
    v.string(`${label}の形式が不正です。`),
    v.trim(),
    v.nonEmpty(`${label}を入力してください。`),
    v.maxLength(
      maxLength,
      `${label}は ${maxLength} 文字以内で入力してください。`,
    ),
  );
}

function optionalString(label: string, maxLength: number) {
  return v.pipe(
    v.string(`${label}の形式が不正です。`),
    v.trim(),
    v.maxLength(
      maxLength,
      `${label}は ${maxLength} 文字以内で入力してください。`,
    ),
  );
}

export const createExpenseRequestCommandSchema = v.object({
  title: requiredString("タイトル", 120),
  amount: v.pipe(
    requiredString("金額", 20),
    v.transform((input) => Number.parseInt(input, 10)),
    v.check(
      (value) => Number.isInteger(value) && value >= 0,
      "金額は 0 以上の整数で入力してください。",
    ),
  ),
  currency: v.nullable(
    v.pipe(
      optionalString("通貨", 3),
      v.transform((input) => input.toUpperCase()),
      v.regex(
        /^[A-Z]{3}$/,
        "通貨コードは 3 文字のアルファベットで入力してください。",
      ),
    ),
  ),
  category: v.nullable(
    v.pipe(
      optionalString("カテゴリ", 20),
      v.picklist(expenseRequestCategories, "カテゴリが不正です。"),
    ),
  ),
  description: v.pipe(
    v.string("説明の形式が不正です。"),
    v.trim(),
    v.maxLength(2000, "説明は 2000 文字以内で入力してください。"),
  ),
  occurredOn: v.nullable(
    v.pipe(
      optionalString("支出日", 10),
      v.regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "支出日は YYYY-MM-DD 形式で入力してください。",
      ),
      v.check(
        (value) => value <= new Date().toISOString().slice(0, 10),
        "支出日に未来日は指定できません。",
      ),
    ),
  ),
  receiptUrl: v.nullable(
    v.pipe(
      optionalString("領収書URL", 2000),
      v.check((value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }, "領収書URLの形式が不正です。"),
      v.check(
        (value) => new URL(value).protocol === "https:",
        "領収書URLは https:// で始まる URL を指定してください。",
      ),
    ),
  ),
});

export const updateExpenseRequestCommandSchema = v.object({
  publicId: expenseRequestPublicIdSchema,
  title: createExpenseRequestCommandSchema.entries.title,
  amount: createExpenseRequestCommandSchema.entries.amount,
  currency: createExpenseRequestCommandSchema.entries.currency,
  category: createExpenseRequestCommandSchema.entries.category,
  description: createExpenseRequestCommandSchema.entries.description,
  occurredOn: createExpenseRequestCommandSchema.entries.occurredOn,
  receiptUrl: createExpenseRequestCommandSchema.entries.receiptUrl,
});

export function parseExpenseRequestPublicId(value: string) {
  const result = v.safeParse(expenseRequestPublicIdSchema, value);

  if (!result.success) {
    return null;
  }

  return result.output;
}

export function createCreateExpenseRequestCommand(
  formData: FormData,
): CreateExpenseRequestCommand {
  assertForbiddenFields(formData, forbiddenCreateFieldMessages);

  return parseCommand(
    createExpenseRequestCommandSchema,
    normalizeExpenseRequestFormInput(formData),
  );
}

export function createUpdateExpenseRequestCommand(
  requestId: string,
  formData: FormData,
): UpdateExpenseRequestCommand {
  assertForbiddenFields(formData, forbiddenUpdateFieldMessages);

  return parseCommand(updateExpenseRequestCommandSchema, {
    publicId: requestId,
    ...normalizeExpenseRequestFormInput(formData),
  });
}

export function createExpenseRequestFormState(
  values: ExpenseRequestFormValues = {},
  errorMessage: string | null = null,
): ExpenseRequestFormState {
  return {
    errorMessage,
    values,
  };
}

export function readExpenseRequestFormValues(
  formData: FormData,
): ExpenseRequestFormValues {
  return normalizeExpenseRequestFormInput(formData);
}

function normalizeExpenseRequestFormInput(
  formData: FormData,
): ExpenseRequestFormInput {
  return {
    title: readFormString(formData, "title", "タイトル") ?? "",
    amount: readFormString(formData, "amount", "金額") ?? "",
    currency: readFormString(formData, "currency", "通貨"),
    category: readFormString(formData, "category", "カテゴリ"),
    description: readFormString(formData, "description", "説明") ?? "",
    occurredOn: readFormString(formData, "occurredOn", "支出日"),
    receiptUrl: readFormString(formData, "receiptUrl", "領収書URL"),
  };
}

function readFormString(formData: FormData, key: string, label: string) {
  const value = formData.get(key);

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ExpenseRequestValidationError(`${label}の形式が不正です。`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue;
}

function assertForbiddenFields(
  formData: FormData,
  messages: Record<string, string>,
) {
  for (const [key, message] of Object.entries(messages)) {
    if (formData.has(key)) {
      throw new ExpenseRequestValidationError(message);
    }
  }
}

function parseCommand<TSchema extends v.GenericSchema>(
  schema: TSchema,
  input: v.InferInput<TSchema>,
): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, input);

  if (!result.success) {
    throw new ExpenseRequestValidationError(
      result.issues[0]?.message ?? "入力内容が不正です。",
    );
  }

  return result.output;
}
