import assert from "node:assert/strict";
import test from "node:test";

import { linkIdentityUserToAuthUser, toActor } from "./identity.ts";

const baseIdentityUser = {
  id: 1,
  authUserId: "auth-1",
  email: "user@example.com",
  name: "User",
  employeeCode: "E0001",
  role: "member" as const,
  departmentId: "dept-general",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  departmentCode: "GENERAL",
  departmentName: "General",
};

test("toActor は IdentityUserWithDepartment を Actor に変換する", () => {
  const actor = toActor(baseIdentityUser);

  assert.equal(actor.authUserId, "auth-1");
  assert.equal(actor.identityUserId, 1);
  assert.equal(actor.departmentCode, "GENERAL");
});

test("toActor は authUserId が無いと失敗する", () => {
  assert.throws(() => toActor({ ...baseIdentityUser, authUserId: null }));
});

test("linkIdentityUserToAuthUser は authUserId と name を更新する", () => {
  const linked = linkIdentityUserToAuthUser(baseIdentityUser, {
    authUserId: "auth-2",
    name: "Updated User",
  });

  assert.equal(linked.authUserId, "auth-2");
  assert.equal(linked.name, "Updated User");
});
