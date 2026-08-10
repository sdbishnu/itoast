import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { RUNTIME_EVENTS } from "../src/index.js";

describe("Runtime Events", () => {
  test("runtime event names are defined", () => {
    assert.equal(RUNTIME_EVENTS.CREATED, "runtime.created");
    assert.equal(RUNTIME_EVENTS.STARTING, "runtime.starting");
    assert.equal(RUNTIME_EVENTS.STARTED, "runtime.started");
    assert.equal(RUNTIME_EVENTS.STOPPING, "runtime.stopping");
    assert.equal(RUNTIME_EVENTS.STOPPED, "runtime.stopped");
    assert.equal(RUNTIME_EVENTS.FAILED, "runtime.failed");
  });

  test("runtime event definitions are immutable", () => {
    assert.equal(Object.isFrozen(RUNTIME_EVENTS), true);
  });
});
