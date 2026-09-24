import type { CurrentUserState } from "./current-user-state";

export type RouteGuardState = "pending" | "error" | "signed_in" | "signed_out";

/**
 * The single decision protected-route gates make from the normalized session.
 * Pending must win even if a session library briefly retains stale user data
 * while refreshing or signing out.
 */
export function resolveRouteGuardState({
  user,
  isPending,
  error,
}: CurrentUserState): RouteGuardState {
  if (isPending) return "pending";
  if (error) return "error";
  return user ? "signed_in" : "signed_out";
}