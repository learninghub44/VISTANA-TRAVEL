export interface RoleChangeCheck {
  actorId: string;
  target: { id: string; role: "admin" | "customer"; email_verified?: boolean } | null;
  makeAdmin: boolean;
  adminCount: number;
}

/** Returns an error message if the change must be refused, otherwise null. */
export function checkRoleChange({ actorId, target, makeAdmin, adminCount }: RoleChangeCheck): string | null {
  if (!target) return "No registered user has that email. Ask them to create an account first.";
  if (makeAdmin) {
    if (target.role === "admin") return "That person is already an admin.";
    // Promotion hands over full control, so only accounts whose email is proven can receive it.
    if (!target.email_verified) return "That user hasn't verified their email yet, so they can't be made an admin.";
    return null;
  }
  if (target.role !== "admin") return "That person is not an admin.";
  if (target.id === actorId) return "You can't remove your own admin access — ask another admin to do it.";
  if (adminCount <= 1) return "At least one admin must remain.";
  return null;
}
