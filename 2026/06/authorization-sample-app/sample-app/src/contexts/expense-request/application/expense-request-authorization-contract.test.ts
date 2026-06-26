import assert from "node:assert/strict";
import test from "node:test";

import { createActor, createExpenseRequest } from "../test-fixtures.ts";
import type { ExpenseRequestAuthorization } from "./expense-request-authorization.ts";

export function registerExpenseRequestAuthorizationContractTests(
  implementationName: string,
  authorization: ExpenseRequestAuthorization,
) {
  test(`${implementationName}: create は member/manager/admin で許可される`, async () => {
    for (const role of ["member", "manager", "admin"] as const) {
      const allowed = await authorization.authorize({
        actor: createActor({ role }),
        action: "create",
      });

      assert.equal(allowed, true);
    }
  });

  test(`${implementationName}: view のデシジョンテーブルを満たす`, async () => {
    const cases = [
      {
        name: "self は draft でも許可",
        actor: createActor({ role: "member", identityUserId: 1001 }),
        expenseRequest: createExpenseRequest({ status: "draft", applicantId: 1001 }),
        expected: true,
      },
      {
        name: "admin + draft + other は拒否",
        actor: createActor({ role: "admin", identityUserId: 9001 }),
        expenseRequest: createExpenseRequest({ status: "draft", applicantId: 1001 }),
        expected: false,
      },
      {
        name: "admin + non-draft + other は許可",
        actor: createActor({ role: "admin", identityUserId: 9001 }),
        expenseRequest: createExpenseRequest({ status: "submitted", applicantId: 1001 }),
        expected: true,
      },
      {
        name: "manager + same dept + non-draft は許可",
        actor: createActor({
          role: "manager",
          identityUserId: 9002,
          departmentId: "dept-sales",
        }),
        expenseRequest: createExpenseRequest({
          status: "submitted",
          applicantId: 1001,
          departmentId: "dept-sales",
        }),
        expected: true,
      },
      {
        name: "manager + same dept + draft は拒否",
        actor: createActor({
          role: "manager",
          identityUserId: 9002,
          departmentId: "dept-sales",
        }),
        expenseRequest: createExpenseRequest({
          status: "draft",
          applicantId: 1001,
          departmentId: "dept-sales",
        }),
        expected: false,
      },
      {
        name: "manager + different dept + non-draft は拒否",
        actor: createActor({
          role: "manager",
          identityUserId: 9002,
          departmentId: "dept-finance",
        }),
        expenseRequest: createExpenseRequest({
          status: "submitted",
          applicantId: 1001,
          departmentId: "dept-sales",
        }),
        expected: false,
      },
    ] as const;

    for (const caseItem of cases) {
      const allowed = await authorization.authorize({
        actor: caseItem.actor,
        action: "view",
        expenseRequest: caseItem.expenseRequest,
      });

      assert.equal(allowed, caseItem.expected, caseItem.name);
    }
  });

  test(
    `${implementationName}: edit/submit/withdraw/delete は applicant 境界で判定される`,
    async () => {
      const expenseRequest = createExpenseRequest({ applicantId: 1001 });
      const actions = ["edit", "submit", "withdraw", "delete"] as const;

      for (const action of actions) {
        const selfAllowed = await authorization.authorize({
          actor: createActor({ identityUserId: 1001 }),
          action,
          expenseRequest,
        });

        const otherAllowed = await authorization.authorize({
          actor: createActor({ identityUserId: 2002 }),
          action,
          expenseRequest,
        });

        assert.equal(selfAllowed, true, `${action} self`);
        assert.equal(otherAllowed, false, `${action} other`);
      }
    },
  );

  test(`${implementationName}: approve/reject のデシジョンテーブルを満たす`, async () => {
    const expenseRequest = createExpenseRequest({ departmentId: "dept-sales" });

    const cases = [
      { action: "approve", actor: createActor({ role: "admin" }), expected: true },
      { action: "approve", actor: createActor({ role: "member" }), expected: false },
      {
        action: "approve",
        actor: createActor({ role: "manager", departmentId: "dept-sales" }),
        expected: true,
      },
      {
        action: "approve",
        actor: createActor({ role: "manager", departmentId: "dept-finance" }),
        expected: false,
      },
      { action: "reject", actor: createActor({ role: "admin" }), expected: true },
      { action: "reject", actor: createActor({ role: "member" }), expected: false },
      {
        action: "reject",
        actor: createActor({ role: "manager", departmentId: "dept-sales" }),
        expected: true,
      },
      {
        action: "reject",
        actor: createActor({ role: "manager", departmentId: "dept-finance" }),
        expected: false,
      },
    ] as const;

    for (const caseItem of cases) {
      const allowed = await authorization.authorize({
        actor: caseItem.actor,
        action: caseItem.action,
        expenseRequest,
      });

      assert.equal(
        allowed,
        caseItem.expected,
        `${caseItem.action} ${caseItem.actor.role}`,
      );
    }
  });

  test(`${implementationName}: invalidate/settle は admin のみ許可される`, async () => {
    const actions = ["invalidate", "settle"] as const;
    const roles = ["member", "manager", "admin"] as const;

    for (const action of actions) {
      for (const role of roles) {
        const allowed = await authorization.authorize({
          actor: createActor({ role }),
          action,
        });

        assert.equal(allowed, role === "admin", `${action} ${role}`);
      }
    }
  });

  test(
    `${implementationName}: resource 必須 action で expenseRequest がない場合は例外`,
    async () => {
      const resourceActions = [
        "view",
        "viewReceipt",
        "edit",
        "submit",
        "withdraw",
        "delete",
        "approve",
        "reject",
      ] as const;

      for (const action of resourceActions) {
        await assert.rejects(
          authorization.authorize({
            actor: createActor(),
            action,
          }),
          /Expense request is required/,
          action,
        );
      }
    },
  );
}
