import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  AuthorizeExpenseRequestInput,
  ExpenseRequestAction,
  ExpenseRequestAuthorization,
} from "./expense-request-authorization";

const resourceRequiredActions = new Set<ExpenseRequestAction>([
  "view",
  "viewReceipt",
  "edit",
  "submit",
  "withdraw",
  "delete",
  "approve",
  "reject",
]);

const policyWasmPath = join(
  process.cwd(),
  "src/contexts/expense-request/policies/opa/expense-request-authorization.wasm",
);
const policyDataPath = join(
  process.cwd(),
  "src/contexts/expense-request/policies/opa/expense-request-authorization-data.json",
);

type OpaEvaluationResult = Readonly<{
  result?: unknown;
}>;

type OpaPolicy = Readonly<{
  setData(data: unknown): void;
  evaluate(input: unknown): OpaEvaluationResult[] | null;
}>;

let policyPromise: Promise<OpaPolicy> | null = null;

async function loadExpenseRequestPolicy() {
  const { loadPolicy } = await import("@open-policy-agent/opa-wasm");
  const policyWasm = await readFile(policyWasmPath);
  const policy = (await loadPolicy(policyWasm)) as OpaPolicy;
  const policyData = await readFile(policyDataPath, "utf8");

  policy.setData(JSON.parse(policyData));

  return policy;
}

function getPolicy() {
  if (!policyPromise) {
    policyPromise = loadExpenseRequestPolicy();
  }

  return policyPromise;
}

function assertResourceIfRequired({
  action,
  expenseRequest,
}: Pick<AuthorizeExpenseRequestInput, "action" | "expenseRequest">) {
  if (!resourceRequiredActions.has(action)) {
    return;
  }

  if (!expenseRequest) {
    throw new Error(`Expense request is required for "${action}" authorization.`);
  }
}

function toOpaInput({ actor, action, expenseRequest }: AuthorizeExpenseRequestInput) {
  return {
    actor: {
      role: actor.role,
      identityUserId: actor.identityUserId,
      departmentId: actor.departmentId,
    },
    action,
    resource: expenseRequest
      ? {
          applicantId: expenseRequest.applicantId,
          departmentId: expenseRequest.departmentId,
          status: expenseRequest.status,
        }
      : null,
  };
}

function toBooleanDecision(resultSet: OpaEvaluationResult[] | null) {
  if (resultSet === null) {
    throw new Error("OPA evaluation returned null.");
  }

  if (resultSet.length === 0) {
    return false;
  }

  const decision = resultSet[0]?.result;

  if (typeof decision !== "boolean") {
    throw new Error("OPA decision result is not a boolean.");
  }

  return decision;
}

export const opaExpenseRequestAuthorization: ExpenseRequestAuthorization = {
  authorize: async ({
    actor,
    action,
    expenseRequest,
  }: AuthorizeExpenseRequestInput) => {
    assertResourceIfRequired({ action, expenseRequest });
    const policy = await getPolicy();

    return toBooleanDecision(
      policy.evaluate(
        toOpaInput({
          actor,
          action,
          expenseRequest,
        }),
      ),
    );
  },
};
