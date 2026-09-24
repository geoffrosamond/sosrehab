import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSessionRetry } from "./session-retry.ts";

describe("session recovery retry", () => {
  it("disables immediately, ignores repeated clicks, and re-enables after completion", async () => {
    const states: boolean[] = [];
    let finish: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    let checks = 0;
    const retry = createSessionRetry((value) => states.push(value));
    const check = () => {
      checks += 1;
      return pending;
    };

    const first = retry(check);
    await retry(check);
    assert.equal(checks, 1);
    assert.deepEqual(states, [true]);

    finish();
    await first;
    assert.deepEqual(states, [true, false]);
    await retry(check);
    assert.equal(checks, 2);
    assert.deepEqual(states, [true, false, true, false]);
  });

  it("re-enables after a rejected or synchronous failed check", async () => {
    const states: boolean[] = [];
    const retry = createSessionRetry((value) => states.push(value));
    await retry(() => Promise.reject(new Error("offline")));
    await retry(() => {
      throw new Error("offline");
    });
    assert.deepEqual(states, [true, false, true, false]);
  });
});
