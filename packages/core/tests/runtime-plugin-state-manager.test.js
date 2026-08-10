import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  RuntimePluginStateManager
} from "../src/plugin/runtime-plugin-state-manager.js";

import {
  RUNTIME_PLUGIN_STATES
} from "../src/plugin/runtime-plugin-state.js";

describe("Runtime Plugin State Manager", () => {
  test("creates an empty state manager", () => {
    const manager =
      new RuntimePluginStateManager();

    assert.deepEqual(
      [...manager.getAll()],
      []
    );
  });

  test("registers a plugin as registered", () => {
    const manager =
      new RuntimePluginStateManager();

    assert.equal(
      manager.register("example"),
      RUNTIME_PLUGIN_STATES.REGISTERED
    );

    assert.equal(
      manager.get("example"),
      RUNTIME_PLUGIN_STATES.REGISTERED
    );
  });

  test("checks whether a plugin is registered", () => {
    const manager =
      new RuntimePluginStateManager();

    assert.equal(
      manager.has("example"),
      false
    );

    manager.register("example");

    assert.equal(
      manager.has("example"),
      true
    );
  });

  test("tracks the complete startup lifecycle", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.INITIALIZING
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.STARTING
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.STARTED
    );

    assert.equal(
      manager.get("example"),
      RUNTIME_PLUGIN_STATES.STARTED
    );
  });

  test("tracks the complete shutdown lifecycle", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.INITIALIZING
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.STARTING
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.STARTED
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.STOPPING
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.STOPPED
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.UNINSTALLING
    );

    manager.transition(
      "example",
      RUNTIME_PLUGIN_STATES.UNINSTALLED
    );

    assert.equal(
      manager.get("example"),
      RUNTIME_PLUGIN_STATES.UNINSTALLED
    );
  });

  test("rejects invalid state transitions", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    assert.throws(
      () =>
        manager.transition(
          "example",
          RUNTIME_PLUGIN_STATES.STARTED
        ),
      /Invalid plugin state transition/
    );
  });

  test("rejects transitions for unknown plugins", () => {
    const manager =
      new RuntimePluginStateManager();

    assert.throws(
      () =>
        manager.transition(
          "missing",
          RUNTIME_PLUGIN_STATES.INSTALLING
        ),
      /Plugin is not registered/
    );
  });

  test("marks a plugin as failed", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    assert.equal(
      manager.fail("example"),
      RUNTIME_PLUGIN_STATES.FAILED
    );

    assert.equal(
      manager.get("example"),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("preserves failed state", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    manager.fail("example");

    manager.fail("example");

    assert.equal(
      manager.get("example"),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("unregisters a plugin state", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    assert.equal(
      manager.unregister("example"),
      true
    );

    assert.equal(
      manager.has("example"),
      false
    );
  });

  test("unregistering an unknown plugin returns false", () => {
    const manager =
      new RuntimePluginStateManager();

    assert.equal(
      manager.unregister("missing"),
      false
    );
  });

  test("clear removes all plugin states", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("first");
    manager.register("second");

    manager.clear();

    assert.deepEqual(
      [...manager.getAll()],
      []
    );
  });

  test("getAll returns an independent map", () => {
    const manager =
      new RuntimePluginStateManager();

    manager.register("example");

    const states =
      manager.getAll();

    states.delete("example");

    assert.equal(
      manager.has("example"),
      true
    );
  });
});