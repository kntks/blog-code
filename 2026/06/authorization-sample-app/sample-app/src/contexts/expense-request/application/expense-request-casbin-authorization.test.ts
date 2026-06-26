import { newEnforcer, newModelFromString, type Enforcer } from "casbin";

import type { Actor } from "@/contexts/identity/domain/identity";

import { registerExpenseRequestAuthorizationContractTests } from "./expense-request-authorization-contract.test.ts";
import type {
  AuthorizeExpenseRequestInput,
  ExpenseRequestAction,
  ExpenseRequestAuthorization,
} from "./expense-request-authorization.ts";
import {
  assertExpenseRequestResourceIfRequired,
  configureExpenseRequestCasbinEnforcer,
  expenseRequestCasbinModelText,
} from "./expense-request-casbin-core.ts";

const policyRules = [
  ["member", "create", "allow"],
  ["manager", "create", "allow"],
  ["admin", "create", "allow"],
  ["member", "view", "allow"],
  ["manager", "view", "allow"],
  ["admin", "view", "allow"],
  ["member", "viewReceipt", "allow"],
  ["manager", "viewReceipt", "allow"],
  ["admin", "viewReceipt", "allow"],
  ["member", "edit", "allow"],
  ["manager", "edit", "allow"],
  ["admin", "edit", "allow"],
  ["member", "submit", "allow"],
  ["manager", "submit", "allow"],
  ["admin", "submit", "allow"],
  ["member", "withdraw", "allow"],
  ["manager", "withdraw", "allow"],
  ["admin", "withdraw", "allow"],
  ["member", "delete", "allow"],
  ["manager", "delete", "allow"],
  ["admin", "delete", "allow"],
  ["manager", "approve", "allow"],
  ["admin", "approve", "allow"],
  ["manager", "reject", "allow"],
  ["admin", "reject", "allow"],
  ["admin", "invalidate", "allow"],
  ["admin", "settle", "allow"],
] as const satisfies ReadonlyArray<
  readonly [Actor["role"], ExpenseRequestAction, "allow"]
>;

async function createInMemoryExpenseRequestEnforcer() {
  const model = newModelFromString(expenseRequestCasbinModelText);
  const enforcer = await newEnforcer(model);

  configureExpenseRequestCasbinEnforcer(enforcer);

  for (const policyRule of policyRules) {
    await enforcer.addPolicy(...policyRule);
  }

  return enforcer;
}

function createTestCasbinExpenseRequestAuthorization(): ExpenseRequestAuthorization {
  let testEnforcerPromise: Promise<Enforcer> | undefined;

  return {
    authorize: async ({
      actor,
      action,
      expenseRequest,
    }: AuthorizeExpenseRequestInput) => {
      assertExpenseRequestResourceIfRequired({ action, expenseRequest });
      testEnforcerPromise ??= createInMemoryExpenseRequestEnforcer();
      const enforcer = await testEnforcerPromise;

      return enforcer.enforce(actor, action, expenseRequest ?? null);
    },
  };
}

registerExpenseRequestAuthorizationContractTests(
  "casbin authorization",
  createTestCasbinExpenseRequestAuthorization(),
);
