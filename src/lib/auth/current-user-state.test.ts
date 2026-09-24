import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEV_USER, resolveCurrentUserState } from "./current-user-state.ts";

describe("resolveCurrentUserState", () => {
  it("returns the stable development user without a pending state when auth is disabled", () => {
    // `authEnabled` is fixed when the auth client module loads, so the hook's
    // conditional `useSession()` call cannot switch branches during a mount.
    const state = resolveCurrentUserState(false, {
      data: null,
      isPending: true,
    });

    assert.equal(state.user, DEV_USER);
    assert.equal(state.isPending, false);
    assert.equal(state.error, null);
    assert.equal(typeof state.retry, "function");
    assert.equal(state.user, DEV_USER);
  });

  it("keeps auth-enabled sessions pending while they are loading", () => {
    const state = resolveCurrentUserState(true, { data: null, isPending: true });
    assert.equal(state.user, null);
    assert.equal(state.isPending, true);
    assert.equal(state.error, null);
  });

  it("keeps auth-enabled visitors signed out after loading resolves without a user", () => {
    const state = resolveCurrentUserState(true, { data: null, isPending: false });
    assert.equal(state.user, null);
    assert.equal(state.isPending, false);
    assert.equal(state.error, null);
  });

  it("keeps a failed session request separate from signed out and returns refetch completion", async () => {
    const failure = new Error("offline");
    let retries = 0;
    let complete: () => void = () => {};
    const finished = new Promise<void>((resolve) => {
      complete = resolve;
    });
    const state = resolveCurrentUserState(true, {
      data: null,
      isPending: false,
      error: failure,
      refetch: () => {
        retries += 1;
        return finished;
      },
    });

    assert.equal(state.user, null);
    assert.equal(state.isPending, false);
    assert.equal(state.error, failure);
    assert.equal(state.retry(), finished);
    assert.equal(retries, 1);
    complete();
    await finished;
  });

  it("normalizes the authenticated session user", () => {
    const state = resolveCurrentUserState(true, {
        data: {
          user: {
            id: "user-1",
            name: "Viewer",
            email: "viewer@example.com",
            image: "https://example.com/viewer.png",
          },
        },
        isPending: false,
      });
    assert.deepEqual(
      state.user,
      {
          id: "user-1",
          displayName: "Viewer",
          primaryEmail: "viewer@example.com",
          profileImageUrl: "https://example.com/viewer.png",
          isDevFallback: false,
      },
    );
    assert.equal(state.isPending, false);
    assert.equal(state.error, null);
  });
});
