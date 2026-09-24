type Listener = () => void;
export type SignOutTransitionState = "idle" | "pending" | "signed_out" | "error";

const listeners = new Set<Listener>();
let state: SignOutTransitionState = "idle";
let signOutOperation: Promise<void> | null = null;
let generation = 0;
let checkRevision = 0;
let recoveryTimer: ReturnType<typeof setTimeout> | undefined;
let verifySession: (() => Promise<boolean>) | undefined;

/** Leave enough time for an ordinary full-page navigation to unload first. */
export const SIGN_OUT_REDIRECT_GRACE_MS = 3000;
export const SIGN_OUT_SESSION_CHECK_TIMEOUT_MS = 5000;

function publish(next: SignOutTransitionState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function clearRecovery(): void {
  generation++;
  checkRevision++;
  if (recoveryTimer !== undefined) clearTimeout(recoveryTimer);
  recoveryTimer = undefined;
  verifySession = undefined;
}

export function subscribeToAuthTransition(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isSigningOut(): boolean {
  return state === "pending";
}

export function getSignOutTransitionState(): SignOutTransitionState {
  return state;
}

export function beginSignOut(): void {
  clearRecovery();
  if (state !== "pending") publish("pending");
}

export function cancelSignOut(): void {
  signOutOperation = null;
  clearRecovery();
  if (state !== "idle") publish("idle");
}

async function checkSession(attempt: number): Promise<void> {
  if (attempt !== generation || !verifySession) return;
  const revision = ++checkRevision;
  publish("pending");
  const check = verifySession;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const signedIn = await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Session check timed out")),
          SIGN_OUT_SESSION_CHECK_TIMEOUT_MS,
        );
      }),
    ]);
    if (attempt !== generation || revision !== checkRevision) return;
    if (signedIn) cancelSignOut();
    else publish("signed_out");
  } catch {
    if (attempt === generation && revision === checkRevision) publish("error");
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

/** An unknown result remains hidden until a fresh check confirms the session. */
export function retrySignOutRecovery(): void {
  if (state !== "error" || !verifySession) return;
  void checkSession(generation);
}

export function runWithSignOutTransition(
  operation: () => Promise<void>,
  verifyAfterRedirect?: () => Promise<boolean>,
): Promise<void> {
  if (signOutOperation) return signOutOperation;
  beginSignOut();
  const attempt = generation;
  // Install the shared promise before invoking the operation, so even calls
  // from separate controls in the same tick cannot start a second request.
  signOutOperation = Promise.resolve()
    .then(operation)
    .then(() => {
      if (attempt === generation && verifyAfterRedirect) {
        verifySession = verifyAfterRedirect;
        recoveryTimer = setTimeout(() => {
          recoveryTimer = undefined;
          void checkSession(attempt);
        }, SIGN_OUT_REDIRECT_GRACE_MS);
      }
    })
    .catch((error: unknown) => {
      if (attempt === generation) cancelSignOut();
      throw error;
    });
  // Keep the resolved promise on success: a redirect may not unload immediately.
  return signOutOperation;
}
