import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  RUNTIME_PLUGIN_STATES
} from "../src/plugin/runtime-plugin-state.js";

describe("Runtime Plugin States", () => {
  test("defines all plugin states", () => {
    assert.equal(
      RUNTIME_PLUGIN_STATES.REGISTERED,
      "registered"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.INSTALLING,
      "installing"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.INSTALLED,
      "installed"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.INITIALIZING,
      "initializing"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.INITIALIZED,
      "initialized"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.STARTING,
      "starting"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.STARTED,
      "started"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.STOPPING,
      "stopping"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.STOPPED,
      "stopped"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.UNINSTALLING,
      "uninstalling"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.UNINSTALLED,
      "uninstalled"
    );

    assert.equal(
      RUNTIME_PLUGIN_STATES.FAILED,
      "failed"
    );
  });

  test("plugin states are immutable", () => {
    assert.equal(
      Object.isFrozen(
        RUNTIME_PLUGIN_STATES
      ),
      true
    );
  });
});