import type { ExpenseRequestAuthorization } from "./expense-request-authorization";
import { casbinExpenseRequestAuthorization } from "./expense-request-casbin-authorization";
import { opaExpenseRequestAuthorization } from "./expense-request-opa-authorization";
import { localExpenseRequestAuthorization } from "./expense-request-policy";

function createExpenseRequestAuthorization(): ExpenseRequestAuthorization {
  const provider = process.env.AUTHZ_PROVIDER ?? "local";

  switch (provider) {
    case "local":
      return localExpenseRequestAuthorization;
    case "opa":
      return opaExpenseRequestAuthorization;
    case "casbin":
      return casbinExpenseRequestAuthorization;
    default:
      throw new Error(`Unsupported AUTHZ_PROVIDER: ${provider}`);
  }
}

const expenseRequestAuthorization = createExpenseRequestAuthorization();

export function getExpenseRequestAuthorization() {
  return expenseRequestAuthorization;
}
