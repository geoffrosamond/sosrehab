/** Normalized user shape used across the app, auth on or off. */
export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  /** True when this is the sandbox/dev fallback (auth not configured). */
  isDevFallback: boolean;
};

/**
 * Stable fallback user, used ONLY when auth is disabled
 * (`VITE_AUTH_ENABLED=false`). Its id matches the server-side fallback so
 * preview data belongs to one consistent owner.
 */
export const DEV_USER: AppUser = {
  id: "dev-user",
  displayName: "Dev User",
  primaryEmail: "dev@example.com",
  profileImageUrl: null,
  isDevFallback: true,
};

const noRetry = () => {};

/** `useCurrentUserState()` result, including session loading and failure state. */
export type CurrentUserState = {
  /** The user — `null` BOTH while the session loads and when signed out. */
  user: AppUser | null;
  /** True while the session is still resolving — don't treat `user: null` as signed out yet. */
  isPending: boolean;
  /** The session request failure, kept separate from an ordinary signed-out result. */
  error: unknown | null;
  /** Retry the failed session request; returns its result so callers can wait for completion. */
  retry: () => unknown;
};

export type AuthSessionSnapshot = {
  data?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } | null;
  } | null;
  isPending: boolean;
  error?: unknown;
  refetch?: () => unknown;
};

/**
 * Normalize either auth branch into the state route guards consume.
 *
 * `authEnabled` is intentionally a module-level value in `client.ts`, not
 * per-render state. The hook can therefore choose its branch conditionally
 * without changing hook order during a mounted component's lifetime.
 */
export function resolveCurrentUserState(
  authEnabled: boolean,
  session: AuthSessionSnapshot | null,
): CurrentUserState {
  if (!authEnabled) {
    return { user: DEV_USER, isPending: false, error: null, retry: noRetry };
  }

  const user = session?.data?.user;
  return {
    user: user
      ? {
          id: user.id,
          displayName: user.name ?? null,
          primaryEmail: user.email ?? null,
          profileImageUrl: user.image ?? null,
          isDevFallback: false,
        }
      : null,
    isPending: session?.isPending ?? false,
    error: session?.error ?? null,
    retry: () => {
      return session?.refetch?.();
    },
  };
}
