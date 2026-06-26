import type {
  ExpenseRequest,
  ExpenseRequestCategory,
  ExpenseRequestStatus,
} from "./domain/expense-request";
import type { Actor, ActorRole } from "../identity/domain/identity";

type ActorOverrides = Partial<Actor>;

type ExpenseRequestOverrides = Partial<ExpenseRequest>;

export function createActor(overrides: ActorOverrides = {}): Actor {
  const role: ActorRole = overrides.role ?? "member";

  return {
    authUserId: "auth-user-1",
    identityUserId: 1001,
    email: "member@example.com",
    name: "Test Member",
    employeeCode: "E001",
    role,
    departmentId: "dept-sales",
    departmentCode: "SALES",
    departmentName: "Sales",
    ...overrides,
  };
}

export function createExpenseRequest(
  overrides: ExpenseRequestOverrides = {},
): ExpenseRequest {
  const status: ExpenseRequestStatus = overrides.status ?? "draft";
  const category: ExpenseRequestCategory | null = overrides.category ?? "travel";
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: 5001,
    publicId: "expreq_test_001",
    applicantId: 1001,
    departmentId: "dept-sales",
    title: "交通費",
    amount: 1000,
    currency: "JPY",
    category,
    description: "営業先訪問",
    occurredOn: "2026-01-01",
    receiptUrl: "https://example.com/receipt.png",
    status,
    submittedAt: status === "submitted" ? now : null,
    approvedAt: status === "approved" ? now : null,
    approverId: status === "approved" ? 2001 : null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
