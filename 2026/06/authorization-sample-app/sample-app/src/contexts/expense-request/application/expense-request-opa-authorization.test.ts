import { registerExpenseRequestAuthorizationContractTests } from "./expense-request-authorization-contract.test.ts";
import { opaExpenseRequestAuthorization } from "./expense-request-opa-authorization.ts";

registerExpenseRequestAuthorizationContractTests(
  "opa authorization",
  opaExpenseRequestAuthorization,
);
