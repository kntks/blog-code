import type { Actor } from "@/contexts/identity/domain/identity";

export function mayViewPendingApprovals(actor: Actor) {
  return actor.role === "manager" || actor.role === "admin";
}
