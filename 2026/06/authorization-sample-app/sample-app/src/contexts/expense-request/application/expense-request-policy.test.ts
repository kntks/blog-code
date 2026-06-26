import { registerExpenseRequestAuthorizationContractTests } from "./expense-request-authorization-contract.test.ts";
import { localExpenseRequestAuthorization } from "./expense-request-policy.ts";

registerExpenseRequestAuthorizationContractTests(
  "local authorization",
  localExpenseRequestAuthorization,
);
