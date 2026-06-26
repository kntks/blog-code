import { createRequire } from "node:module";

import { newEnforcer, newModelFromString, type Enforcer } from "casbin";
import { drizzle } from "drizzle-orm/node-postgres";

import type {
  AuthorizeExpenseRequestInput,
  ExpenseRequestAuthorization,
} from "./expense-request-authorization";
import {
  assertExpenseRequestResourceIfRequired,
  configureExpenseRequestCasbinEnforcer,
  expenseRequestCasbinModelText,
} from "./expense-request-casbin-core.ts";

let databaseEnforcerPromise: Promise<Enforcer> | undefined;
const require = createRequire(import.meta.url);
const { default: DrizzleAdapter, casbinRulePostgres } =
  require("drizzle-adapter") as typeof import("drizzle-adapter");

async function createDatabaseBackedExpenseRequestEnforcer() {
  const { getPool } = await import("../../../shared/db/pool.ts");
  const model = newModelFromString(expenseRequestCasbinModelText);
  const db = drizzle({
    client: getPool(),
  });
  const adapter = await DrizzleAdapter.newAdapter({
    db,
    table: casbinRulePostgres,
  });
  const enforcer = await newEnforcer(model, adapter);

  configureExpenseRequestCasbinEnforcer(enforcer);
  // NOTE: サンプルアプリケーションであるため、全ポリシーのロードを行っている。
  // 実際のアプリケーションでは必要なポリシーのみを enforcer.loadFilteredPolicy でロードする
  await enforcer.loadPolicy();

  return enforcer;
}

function getDatabaseBackedExpenseRequestEnforcer() {
  databaseEnforcerPromise ??= createDatabaseBackedExpenseRequestEnforcer();
  return databaseEnforcerPromise;
}

function createExpenseRequestAuthorization(
  getEnforcer: () => Promise<Enforcer>,
): ExpenseRequestAuthorization {
  return {
    authorize: async ({
      actor,
      action,
      expenseRequest,
    }: AuthorizeExpenseRequestInput) => {
      assertExpenseRequestResourceIfRequired({ action, expenseRequest });
      const enforcer = await getEnforcer();

      return enforcer.enforce(actor, action, expenseRequest ?? null);
    },
  };
}

export const casbinExpenseRequestAuthorization =
  createExpenseRequestAuthorization(getDatabaseBackedExpenseRequestEnforcer);
