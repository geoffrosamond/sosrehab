import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveSignInGateState } from "./sign-in-gate.ts";

describe("resolveSignInGateState", () => {
  it("is pending while the session check is in flight, user or not", () => {
    assert.equal(
      resolveSignInGateState({ isPending: true, hasError: false, hasUser: false }),
      "pending",
    );
    assert.equal(
      resolveSignInGateState({ isPending: true, hasError: true, hasUser: true }),
      "pending",
    );
  });

  it("is signed_in once a user is present", () => {
    assert.equal(
      resolveSignInGateState({ isPending: false, hasError: false, hasUser: true }),
      "signed_in",
    );
  });

  it("is signed_out only after the check resolved with no user", () => {
    assert.equal(
      resolveSignInGateState({ isPending: false, hasError: false, hasUser: false }),
      "signed_out",
    );
  });

  it("shows recovery when session loading failed instead of treating it as signed out", () => {
    assert.equal(
      resolveSignInGateState({ isPending: false, hasError: true, hasUser: false }),
      "error",
    );
  });
});
