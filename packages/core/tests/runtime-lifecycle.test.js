import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  RUNTIME_STATES,
  RuntimeError,
  canTransition,
  transitionState
} from "../src/index.js";

describe("Runtime Lifecycle", () => {
  test("created can transition to starting", () => {
    assert.equal(
      canTransition(RUNTIME_STATES.CREATED, RUNTIME_STATES.STARTING),
      true
    );
  });

  test("starting can transition to running", () => {
    assert.equal(
      canTransition(RUNTIME_STATES.STARTING, RUNTIME_STATES.RUNNING),
      true
    );
  });

  test("running can transition to stopping", () => {
    assert.equal(
      canTransition(RUNTIME_STATES.RUNNING, RUNTIME_STATES.STOPPING),
      true
    );
  });

  test("stopping can transition to stopped", () => {
    assert.equal(
      canTransition(RUNTIME_STATES.STOPPING, RUNTIME_STATES.STOPPED),
      true
    );
  });

  test("invalid transitions throw RuntimeError", () => {
    assert.equal(
      canTransition(RUNTIME_STATES.CREATED, RUNTIME_STATES.RUNNING),
      false
    );

    assert.throws(
      () => transitionState(RUNTIME_STATES.CREATED, RUNTIME_STATES.RUNNING),
      (error) => {
        assert.equal(error instanceof RuntimeError, true);
        assert.equal(error.code, "RUNTIME_INVALID_STATE_TRANSITION");
        assert.equal(error.details.currentState, RUNTIME_STATES.CREATED);
        assert.equal(error.details.nextState, RUNTIME_STATES.RUNNING);
        return true;
      }
    );
  });

  test("failed state can transition to stopped", () => {
    assert.equal(
      canTransition(RUNTIME_STATES.FAILED, RUNTIME_STATES.STOPPED),
      true
    );
  });
});
