import { useSyncExternalStore } from "react";
import {
  getSignOutTransitionState,
  retrySignOutRecovery,
  subscribeToAuthTransition,
} from "./auth-transition-store";
import { authClient, authEnabled } from "./client";
import {
  DEV_USER,
  resolveCurrentUserState,
  type AppUser,
  type CurrentUserState,
} from "./current-user-state";

export { DEV_USER };
export type { AppUser, CurrentUserState };

/**
 * Current user + session request state. Same behavior in live preview and when deployed:
 *   - Auth enabled -> the real signed-in user; `user` is `null` while
 *                            the session resolves (`isPending: true`) and when
 *                            signed out (`isPending: false`). Session comes from
 *                            Better Auth `useSession()` → `/api/auth/get-session`
 *                            (cookie when deployed; bearer in live preview).
 *   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
 *
 * Prefer `<SignInGate>` for protected content: it waits out `isPending` and
 * provides recovery controls when `error` is set. When writing a custom guard,
 * handle `error` before acting on `user` —
 * redirecting on `user: null` alone bounces signed-in visitors to sign-in on
 * every hard reload:
 *
 *   import { RedirectToSignIn } from "@/lib/auth/gates";
 *   const { user, isPending, error, retry } = useCurrentUserState();
 *   if (isPending) return null;              // still resolving — don't redirect yet
 *   if (error) return <button onClick={retry}>Try again</button>;
 *   if (!user) return <RedirectToSignIn />;  // definitely signed out
 *
 * `authEnabled` is a module-level constant fixed at load, so the guarded hook
 * call keeps a stable hook order across every render of a given component.
 */
export function useCurrentUserState(): CurrentUserState {
  const signOutState = useSyncExternalStore(
    subscribeToAuthTransition,
    getSignOutTransitionState,
    () => "idle",
  );
  const session = authEnabled ? authClient.useSession() : null;
  if (!authEnabled) return resolveCurrentUserState(false, null);
  if (signOutState === "pending") {
    return { user: null, isPending: true, error: null, retry: () => {} };
  }
  if (signOutState === "signed_out") {
    return { user: null, isPending: false, error: null, retry: () => {} };
  }
  if (signOutState === "error") {
    return {
      user: null,
      isPending: false,
      error: new Error("Could not verify session after sign-out"),
      retry: retrySignOutRecovery,
    };
  }
  return resolveCurrentUserState(true, session);
}

/**
 * Convenience view of `useCurrentUserState().user` for display (e.g.
 * `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
 * for redirects/guards use `useCurrentUserState()` and check `isPending`.
 */
export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}
