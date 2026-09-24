import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cancelSignOut,
  getSignOutTransitionState,
  isSigningOut,
  retrySignOutRecovery,
  runWithSignOutTransition,
  SIGN_OUT_REDIRECT_GRACE_MS,
  SIGN_OUT_SESSION_CHECK_TIMEOUT_MS,
  subscribeToAuthTransition,
} from "./auth-transition-store.ts";
import { resolveCurrentUserState, type AuthSessionSnapshot } from "./current-user-state.ts";
import { resolveRouteGuardState } from "./route-guard-state.ts";

function guard(session: AuthSessionSnapshot) {
  return resolveRouteGuardState(resolveCurrentUserState(true, session));
}

describe("protected route session transitions", () => {
  it("holds a hard-refreshed signed-in visitor while the session resolves, then restores access", () => {
    const states = [
      guard({ data: null, isPending: true }),
      guard({
        data: { user: { id: "user-1", name: "Viewer" } },
        isPending: false,
      }),
    ];

    assert.deepEqual(states, ["pending", "signed_in"]);
    assert.ok(!states.includes("signed_out"), "a refresh must not redirect through signed-out");
  });

  it("redirects a signed-out visitor only after session loading resolves", () => {
    const states = [
      guard({ data: null, isPending: true }),
      guard({ data: null, isPending: false }),
    ];

    assert.deepEqual(states, ["pending", "signed_out"]);
  });

  it("does not treat a failed session request as signed out", () => {
    assert.equal(
      guard({ data: null, isPending: false, error: new Error("offline") }),
      "error",
    );
  });

  it("removes access immediately while the sign-out operation keeps stale session data", async () => {
    const staleSession = resolveCurrentUserState(true, {
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    const notifications: boolean[] = [];
    const unsubscribe = subscribeToAuthTransition(() => notifications.push(isSigningOut()));

    const states = [
      resolveRouteGuardState(staleSession),
    ];
    let finishSignOut!: () => void;
    const pendingSignOut = new Promise<void>((resolve) => {
      finishSignOut = resolve;
    });
    const signOutDone = runWithSignOutTransition(() => pendingSignOut);
    states.push(
      resolveRouteGuardState(
        isSigningOut()
          ? { user: null, isPending: true, error: null, retry: () => {} }
          : staleSession,
      ),
    );
    finishSignOut();
    await signOutDone;
    cancelSignOut();
    states.push(resolveRouteGuardState(guardStateAfterSignOut()));
    unsubscribe();

    assert.deepEqual(states, ["signed_in", "pending", "signed_out"]);
    assert.deepEqual(notifications, [true, false]);
  });

  it("restores the prior guard state when sign-out fails", async () => {
    const staleSession = resolveCurrentUserState(true, {
      data: { user: { id: "user-1" } },
      isPending: false,
    });

    await assert.rejects(
      runWithSignOutTransition(() => Promise.reject(new Error("network down"))),
      /network down/,
    );

    assert.equal(isSigningOut(), false);
    assert.equal(resolveRouteGuardState(staleSession), "signed_in");
  });

  it("shares a sign-out across controls and keeps the redirect guarded after success", async () => {
    const notifications: boolean[] = [];
    const unsubscribe = subscribeToAuthTransition(() => notifications.push(isSigningOut()));
    let finishRequest!: () => void;
    const request = new Promise<void>((resolve) => {
      finishRequest = resolve;
    });
    let requests = 0;
    let redirects = 0;
    const first = runWithSignOutTransition(() => {
      requests++;
      return request;
    });
    const second = runWithSignOutTransition(() => {
      requests++;
      return Promise.resolve();
    });
    assert.strictEqual(first, second);
    assert.equal(isSigningOut(), true);
    await Promise.resolve();
    assert.equal(requests, 1);
    finishRequest();
    await Promise.all([first, second]);
    await runWithSignOutTransition(async () => {
      requests++;
      redirects++;
    });
    assert.deepEqual({ requests, redirects }, { requests: 1, redirects: 0 });
    assert.deepEqual(notifications, [true]);
    cancelSignOut();
    unsubscribe();
  });

  it("shares a failure with both controls and permits a later retry", async () => {
    let failRequest!: (error: Error) => void;
    const request = new Promise<void>((_resolve, reject) => {
      failRequest = reject;
    });
    let requests = 0;
    const first = runWithSignOutTransition(() => {
      requests++;
      return request;
    });
    const second = runWithSignOutTransition(() => {
      requests++;
      return Promise.resolve();
    });
    assert.strictEqual(first, second);
    await Promise.resolve();
    failRequest(new Error("network down"));
    const results = await Promise.allSettled([first, second]);
    assert.equal(requests, 1);
    assert.deepEqual(results.map((result) => result.status), ["rejected", "rejected"]);
    assert.equal(isSigningOut(), false);
    await runWithSignOutTransition(() => {
      requests++;
      return Promise.resolve();
    });
    assert.equal(requests, 2);
    cancelSignOut();
  });
});

function guardStateAfterSignOut() {
  return resolveCurrentUserState(true, { data: null, isPending: false });
}

describe("redirect recovery", () => {
  it("leaves a normal redirect untouched until the grace period, then restores only a verified session", async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let checks = 0;
    try {
      await runWithSignOutTransition(async () => {}, async () => {
        checks++;
        return true;
      });
      t.mock.timers.tick(SIGN_OUT_REDIRECT_GRACE_MS - 1);
      assert.equal(checks, 0);
      assert.equal(getSignOutTransitionState(), "pending");
      t.mock.timers.tick(1);
      await Promise.resolve();
      await Promise.resolve();
      assert.equal(checks, 1);
      assert.equal(getSignOutTransitionState(), "idle");
    } finally {
      cancelSignOut();
    }
  });

  it("shows signed-out state instead of stale protected content when the check finds no session", async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    try {
      await runWithSignOutTransition(async () => {}, async () => false);
      t.mock.timers.tick(SIGN_OUT_REDIRECT_GRACE_MS);
      await Promise.resolve();
      await Promise.resolve();
      assert.equal(getSignOutTransitionState(), "signed_out");
      assert.equal(isSigningOut(), false);
    } finally {
      cancelSignOut();
    }
  });

  it("keeps protected content hidden on a failed check until retry confirms the session", async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let checks = 0;
    try {
      await runWithSignOutTransition(async () => {}, async () => {
        if (++checks === 1) throw new Error("offline");
        return true;
      });
      t.mock.timers.tick(SIGN_OUT_REDIRECT_GRACE_MS);
      await Promise.resolve();
      await Promise.resolve();
      assert.equal(getSignOutTransitionState(), "error");
      retrySignOutRecovery();
      assert.equal(getSignOutTransitionState(), "pending");
      await Promise.resolve();
      await Promise.resolve();
      assert.equal(getSignOutTransitionState(), "idle");
    } finally {
      cancelSignOut();
    }
  });

  it("shows an error after a timed-out check, and retries without trusting a late result", async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let resolveFirst: (value: boolean) => void = () => {};
    let checks = 0;
    try {
      await runWithSignOutTransition(async () => {}, () => {
        checks++;
        return checks === 1
          ? new Promise<boolean>((resolve) => { resolveFirst = resolve; })
          : Promise.resolve(true);
      });
      t.mock.timers.tick(SIGN_OUT_REDIRECT_GRACE_MS);
      t.mock.timers.tick(SIGN_OUT_SESSION_CHECK_TIMEOUT_MS);
      await Promise.resolve();
      await Promise.resolve();
      assert.equal(getSignOutTransitionState(), "error");
      retrySignOutRecovery();
      await Promise.resolve();
      resolveFirst(false);
      await Promise.resolve();
      assert.equal(checks, 2);
      assert.equal(getSignOutTransitionState(), "idle");
    } finally {
      cancelSignOut();
    }
  });
});
