import assert from "node:assert/strict";
import test from "node:test";

import { createActor, createExpenseRequest } from "../test-fixtures.ts";
import {
  ExpenseRequestDomainError,
  approveExpenseRequest,
  invalidateExpenseRequest,
  rejectExpenseRequest,
  settleExpenseRequest,
  submitExpenseRequest,
  withdrawExpenseRequest,
} from "./expense-request.ts";

test("submit: amount 境界値 1 は成功し 0 は失敗する", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");

  const submitted = submitExpenseRequest(
    createExpenseRequest({ status: "draft", amount: 1 }),
    now,
  );

  assert.equal(submitted.status, "submitted");
  assert.equal(submitted.submittedAt, now);

  assert.throws(
    () =>
      submitExpenseRequest(
        createExpenseRequest({ status: "draft", amount: 0 }),
        now,
      ),
    ExpenseRequestDomainError,
  );
});

test("submit: 必須入力境界（空タイトル/空説明/nullカテゴリ/null支出日）は失敗", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");
  const invalidCases = [
    createExpenseRequest({ status: "draft", title: "   " }),
    createExpenseRequest({ status: "draft", description: "   " }),
    createExpenseRequest({ status: "draft", category: null }),
    createExpenseRequest({ status: "draft", occurredOn: null }),
  ];

  for (const expenseRequest of invalidCases) {
    assert.throws(
      () => submitExpenseRequest(expenseRequest, now),
      ExpenseRequestDomainError,
    );
  }
});

test("submit: draft 以外の status は失敗", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");
  const statuses = [
    "submitted",
    "approved",
    "withdrawn",
    "settled",
    "invalidated",
  ] as const;

  for (const status of statuses) {
    assert.throws(
      () => submitExpenseRequest(createExpenseRequest({ status }), now),
      ExpenseRequestDomainError,
      status,
    );
  }
});

test("withdraw: submitted 以外の status は失敗", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");
  const statuses = ["draft", "approved", "withdrawn", "settled", "invalidated"] as const;

  for (const status of statuses) {
    assert.throws(
      () => withdrawExpenseRequest(createExpenseRequest({ status }), now),
      ExpenseRequestDomainError,
      status,
    );
  }
});

test("approve: submitted かつ本人以外のみ成功", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");
  const approver = createActor({ identityUserId: 2001 });
  const approved = approveExpenseRequest(
    createExpenseRequest({ status: "submitted", applicantId: 1001 }),
    approver,
    now,
  );

  assert.equal(approved.status, "approved");
  assert.equal(approved.approverId, 2001);

  assert.throws(
    () =>
      approveExpenseRequest(
        createExpenseRequest({ status: "submitted", applicantId: 1001 }),
        createActor({ identityUserId: 1001 }),
        now,
      ),
    ExpenseRequestDomainError,
  );

  assert.throws(
    () =>
      approveExpenseRequest(
        createExpenseRequest({ status: "draft", applicantId: 1001 }),
        approver,
        now,
      ),
    ExpenseRequestDomainError,
  );
});

test("reject: submitted かつ本人以外のみ成功", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");
  const reviewer = createActor({ identityUserId: 2001 });
  const rejected = rejectExpenseRequest(
    createExpenseRequest({
      status: "submitted",
      applicantId: 1001,
      submittedAt: now,
      approvedAt: now,
      approverId: 2001,
    }),
    reviewer,
    now,
  );

  assert.equal(rejected.status, "draft");
  assert.equal(rejected.submittedAt, null);
  assert.equal(rejected.approvedAt, null);
  assert.equal(rejected.approverId, null);

  assert.throws(
    () =>
      rejectExpenseRequest(
        createExpenseRequest({ status: "submitted", applicantId: 1001 }),
        createActor({ identityUserId: 1001 }),
        now,
      ),
    ExpenseRequestDomainError,
  );

  assert.throws(
    () =>
      rejectExpenseRequest(
        createExpenseRequest({ status: "approved", applicantId: 1001 }),
        reviewer,
        now,
      ),
    ExpenseRequestDomainError,
  );
});

test("invalidate: submitted/approved/withdrawn 以外は失敗", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");

  for (const status of ["submitted", "approved", "withdrawn"] as const) {
    const invalidated = invalidateExpenseRequest(
      createExpenseRequest({ status }),
      now,
    );
    assert.equal(invalidated.status, "invalidated");
  }

  for (const status of ["draft", "settled", "invalidated"] as const) {
    assert.throws(
      () => invalidateExpenseRequest(createExpenseRequest({ status }), now),
      ExpenseRequestDomainError,
      status,
    );
  }
});

test("settle: approved 以外は失敗", () => {
  const now = new Date("2026-02-01T00:00:00.000Z");
  const settled = settleExpenseRequest(createExpenseRequest({ status: "approved" }), now);
  assert.equal(settled.status, "settled");

  for (const status of [
    "draft",
    "submitted",
    "withdrawn",
    "settled",
    "invalidated",
  ] as const) {
    assert.throws(
      () => settleExpenseRequest(createExpenseRequest({ status }), now),
      ExpenseRequestDomainError,
      status,
    );
  }
});
