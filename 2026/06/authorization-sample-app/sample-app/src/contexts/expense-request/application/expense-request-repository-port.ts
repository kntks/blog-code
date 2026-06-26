import type { ExpenseRequest } from "../domain/expense-request";
import type { Actor } from "@/contexts/identity/domain/identity";

export type CreateExpenseRequestRecordInput = Omit<
  ExpenseRequest,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateExpenseRequestRecordInput = Partial<
  Omit<ExpenseRequest, "id" | "publicId" | "createdAt">
>;

export interface ExpenseRequestRepository {
  findByPublicId(publicId: string): Promise<ExpenseRequest | null>;
  create(input: CreateExpenseRequestRecordInput): Promise<ExpenseRequest>;
  save(expenseRequest: ExpenseRequest): Promise<ExpenseRequest | null>;
  remove(id: number): Promise<ExpenseRequest | null>;
}

export interface ExpenseRequestQuery {
  listForActor(actor: Actor): Promise<ExpenseRequest[]>;
  listPendingApprovals(actor: Actor): Promise<ExpenseRequest[]>;
}
