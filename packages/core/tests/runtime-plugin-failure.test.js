import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  RuntimePluginFailure
} from "../src/plugin/runtime-plugin-failure.js";

import {
  RuntimePluginStateManager
} from "../src/plugin/runtime-plugin-state-manager.js";

import {
  RUNTIME_PLUGIN_STATES
} from "../src/plugin/runtime-plugin-state.js";

describe("Runtime Plugin Failure", () => {
  test("creates a plugin failure", () => {
    const error = new Error(
      "Plugin failed"
    );

    const failure =
      new RuntimePluginFailure(
        "example",
        error,
        "start"
      );

    assert.equal(
      failure.getPluginId(),
      "example"
    );

    assert.equal(
      failure.getError(),
      error
    );

    assert.equal(
      failure.getPhase(),
      "start"
    );

    assert.equal(
      failure.getState(),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("plugin failure is immutable", () => {
    const failure =
      new RuntimePluginFailure(
        "example",
        new Error("Failed"),
        "install"
      );

    assert.equal(
      Object.isFrozen(failure),
      true
    );
  });

  test("state manager stores failure details", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    const failure =
      new RuntimePluginFailure(
        "example",
        new Error("Failed"),
        "start"
      );

    manager.fail(
      "example",
      failure
    );

    assert.equal(
      manager.get("example"),
      RUNTIME_PLUGIN_STATES.FAILED
    );

    assert.equal(
      manager.getFailure("example"),
      failure
    );

    assert.equal(
      manager.hasFailure("example"),
      true
    );
  });

  test("state manager returns all failures", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("first");
    manager.register("second");

    const firstFailure =
      new RuntimePluginFailure(
        "first",
        new Error("First failed"),
        "start"
      );

    const secondFailure =
      new RuntimePluginFailure(
        "second",
        new Error("Second failed"),
        "initialize"
      );

    manager.fail(
      "first",
      firstFailure
    );

    manager.fail(
      "second",
      secondFailure
    );

    const failures =
      manager.getFailures();

    assert.equal(
      failures.get("first"),
      firstFailure
    );

    assert.equal(
      failures.get("second"),
      secondFailure
    );
  });

  test("unregister removes failure details", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    const failure =
      new RuntimePluginFailure(
        "example",
        new Error("Failed"),
        "start"
      );

    manager.fail(
      "example",
      failure
    );

    manager.unregister("example");

    assert.equal(
      manager.getFailure("example"),
      undefined
    );

    assert.equal(
      manager.hasFailure("example"),
      false
    );
  });

  test("clear removes failure details", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    manager.fail(
      "example",
      new RuntimePluginFailure(
        "example",
        new Error("Failed"),
        "start"
      )
    );

    manager.clear();

    assert.equal(
      manager.getFailure("example"),
      undefined
    );
  });
});