import assert from "node:assert/strict";
import test from "node:test";

import { mayViewPendingApprovals } from "./approval-policy.ts";

const baseActor = {
  authUserId: "auth-1",
  identityUserId: 1,
  email: "user@example.com",
  name: "User",
  employeeCode: "E0001",
  departmentId: "dept-general",
  departmentCode: "GENERAL",
  departmentName: "General",
};

test("mayViewPendingApprovals は manager/admin のみ許可する", () => {
  assert.equal(
    mayViewPendingApprovals({ ...baseActor, role: "member" }),
    false,
  );
  assert.equal(
    mayViewPendingApprovals({ ...baseActor, role: "manager" }),
    true,
  );
  assert.equal(mayViewPendingApprovals({ ...baseActor, role: "admin" }), true);
});
