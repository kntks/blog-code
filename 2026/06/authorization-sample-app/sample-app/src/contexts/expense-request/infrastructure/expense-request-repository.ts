import { and, desc, eq, ne, or } from "drizzle-orm";

import type { ExpenseRequest } from "@/contexts/expense-request/domain/expense-request";
import type { Actor } from "@/contexts/identity/domain/identity";
import { db } from "@/shared/db/client";

import { expenseRequestsTable } from "./schema";

type CreateExpenseRequestRecordInput = Omit<
  ExpenseRequest,
  "id" | "createdAt" | "updatedAt"
>;

type UpdateExpenseRequestRecordInput = Partial<
  Omit<ExpenseRequest, "id" | "publicId" | "createdAt">
>;

export async function listExpenseRequestRecordsForActor(
  actor: Actor,
): Promise<ExpenseRequest[]> {
  const baseQuery = db
    .select()
    .from(expenseRequestsTable)
    .orderBy(desc(expenseRequestsTable.createdAt));

  if (actor.role === "admin") {
    return baseQuery.where(
      or(
        eq(expenseRequestsTable.applicantId, actor.identityUserId),
        ne(expenseRequestsTable.status, "draft"),
      ),
    );
  }

  if (actor.role === "manager") {
    return baseQuery.where(
      or(
        eq(expenseRequestsTable.applicantId, actor.identityUserId),
        and(
          eq(expenseRequestsTable.departmentId, actor.departmentId),
          ne(expenseRequestsTable.status, "draft"),
        ),
      ),
    );
  }

  return baseQuery.where(
    eq(expenseRequestsTable.applicantId, actor.identityUserId),
  );
}

export async function listPendingApprovalRecords(
  actor: Actor,
): Promise<ExpenseRequest[]> {
  if (actor.role === "admin") {
    return db
      .select()
      .from(expenseRequestsTable)
      .where(
        and(
          eq(expenseRequestsTable.status, "submitted"),
          ne(expenseRequestsTable.applicantId, actor.identityUserId),
        ),
      )
      .orderBy(desc(expenseRequestsTable.updatedAt));
  }

  if (actor.role === "manager") {
    return db
      .select()
      .from(expenseRequestsTable)
      .where(
        and(
          eq(expenseRequestsTable.status, "submitted"),
          eq(expenseRequestsTable.departmentId, actor.departmentId),
          ne(expenseRequestsTable.applicantId, actor.identityUserId),
        ),
      )
      .orderBy(desc(expenseRequestsTable.updatedAt));
  }

  return [];
}

export async function findExpenseRequestById(
  id: number,
): Promise<ExpenseRequest | null> {
  const [expenseRequest] = await db
    .select()
    .from(expenseRequestsTable)
    .where(eq(expenseRequestsTable.id, id))
    .limit(1);

  return expenseRequest ?? null;
}

export async function findExpenseRequestByPublicId(
  publicId: string,
): Promise<ExpenseRequest | null> {
  const [expenseRequest] = await db
    .select()
    .from(expenseRequestsTable)
    .where(eq(expenseRequestsTable.publicId, publicId))
    .limit(1);

  return expenseRequest ?? null;
}

export async function createExpenseRequestRecord(
  input: CreateExpenseRequestRecordInput,
) {
  const [createdExpenseRequest] = await db
    .insert(expenseRequestsTable)
    .values(input)
    .returning();

  if (!createdExpenseRequest) {
    throw new Error("Failed to create expense request.");
  }

  return createdExpenseRequest;
}

export async function updateExpenseRequestRecord(
  id: number,
  input: UpdateExpenseRequestRecordInput,
) {
  const [updatedExpenseRequest] = await db
    .update(expenseRequestsTable)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(expenseRequestsTable.id, id))
    .returning();

  return updatedExpenseRequest ?? null;
}

export async function saveExpenseRequest(expenseRequest: ExpenseRequest) {
  return updateExpenseRequestRecord(expenseRequest.id, {
    applicantId: expenseRequest.applicantId,
    departmentId: expenseRequest.departmentId,
    title: expenseRequest.title,
    amount: expenseRequest.amount,
    currency: expenseRequest.currency,
    category: expenseRequest.category,
    description: expenseRequest.description,
    occurredOn: expenseRequest.occurredOn,
    receiptUrl: expenseRequest.receiptUrl,
    status: expenseRequest.status,
    submittedAt: expenseRequest.submittedAt,
    approvedAt: expenseRequest.approvedAt,
    approverId: expenseRequest.approverId,
  });
}

export async function deleteExpenseRequestRecord(id: number) {
  const [deletedExpenseRequest] = await db
    .delete(expenseRequestsTable)
    .where(eq(expenseRequestsTable.id, id))
    .returning();

  return deletedExpenseRequest ?? null;
}
