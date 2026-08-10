import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  installPlugin,
  initializePlugin,
  startPlugin,
  stopPlugin,
  uninstallPlugin
} from "../src/plugin/runtime-plugin-lifecycle.js";

import {
  RuntimePluginStateManager
} from "../src/plugin/runtime-plugin-state-manager.js";

import {
  RUNTIME_PLUGIN_STATES
} from "../src/plugin/runtime-plugin-state.js";

describe("Runtime Plugin Lifecycle", () => {
  test("installs a plugin", async () => {
    const execution = [];

    const plugin = {
      id: "example",

      async install() {
        execution.push("install");
      }
    };

    const stateManager =
      new RuntimePluginStateManager();

    stateManager.register(plugin.id);

    await installPlugin(
      plugin,
      {},
      stateManager
    );

    assert.deepEqual(
      execution,
      ["install"]
    );

    assert.equal(
      stateManager.get(plugin.id),
      RUNTIME_PLUGIN_STATES.INSTALLED
    );
  });

  test("initializes a plugin", async () => {
    const execution = [];

    const plugin = {
      id: "example",

      async initialize() {
        execution.push("initialize");
      }
    };

    const stateManager =
      new RuntimePluginStateManager();

    stateManager.register(plugin.id);

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    await initializePlugin(
      plugin,
      {},
      stateManager
    );

    assert.deepEqual(
      execution,
      ["initialize"]
    );

    assert.equal(
      stateManager.get(plugin.id),
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );
  });

  test("starts a plugin", async () => {
    const execution = [];

    const plugin = {
      id: "example",

      async start() {
        execution.push("start");
      }
    };

    const stateManager =
      new RuntimePluginStateManager();

    stateManager.register(plugin.id);

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );

    await startPlugin(
      plugin,
      {},
      stateManager
    );

    assert.deepEqual(
      execution,
      ["start"]
    );

    assert.equal(
      stateManager.get(plugin.id),
      RUNTIME_PLUGIN_STATES.STARTED
    );
  });

  test("stops a plugin", async () => {
    const execution = [];

    const plugin = {
      id: "example",

      async stop() {
        execution.push("stop");
      }
    };

    const stateManager =
      new RuntimePluginStateManager();

    stateManager.register(plugin.id);

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STARTING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STARTED
    );

    await stopPlugin(
      plugin,
      {},
      stateManager
    );

    assert.deepEqual(
      execution,
      ["stop"]
    );

    assert.equal(
      stateManager.get(plugin.id),
      RUNTIME_PLUGIN_STATES.STOPPED
    );
  });

  test("uninstalls a plugin", async () => {
    const execution = [];

    const plugin = {
      id: "example",

      async uninstall() {
        execution.push("uninstall");
      }
    };

    const stateManager =
      new RuntimePluginStateManager();

    stateManager.register(plugin.id);

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STARTING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STARTED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STOPPING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STOPPED
    );

    await uninstallPlugin(
      plugin,
      {},
      stateManager
    );

    assert.deepEqual(
      execution,
      ["uninstall"]
    );

    assert.equal(
      stateManager.get(plugin.id),
      RUNTIME_PLUGIN_STATES.UNINSTALLED
    );
  });

  test("rejects an invalid plugin", async () => {
    const stateManager =
      new RuntimePluginStateManager();

    await assert.rejects(
      installPlugin(
        {},
        {},
        stateManager
      ),
      TypeError
    );
  });

  test("propagates install errors", async () => {
    const stateManager =
      new RuntimePluginStateManager();

    const error = new Error(
      "Install failed"
    );

    const plugin = {
      id: "example",

      async install() {
        throw error;
      }
    };

    stateManager.register(plugin.id);

    await assert.rejects(
      installPlugin(
        plugin,
        {},
        stateManager
      ),
      error
    );

    assert.equal(
      stateManager.get(plugin.id),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("stores install failure details", async () => {
    const stateManager =
      new RuntimePluginStateManager();

    const error = new Error(
      "Install failed"
    );

    const plugin = {
      id: "example",

      async install() {
        throw error;
      }
    };

    stateManager.register(plugin.id);

    await assert.rejects(
      installPlugin(
        plugin,
        {},
        stateManager
      ),
      error
    );

    const failure =
      stateManager.getFailure(
        plugin.id
      );

    assert.ok(failure);

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
      "install"
    );

    assert.equal(
      failure.getState(),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("stores initialize failure details", async () => {
    const stateManager =
      new RuntimePluginStateManager();

    const error = new Error(
      "Initialize failed"
    );

    const plugin = {
      id: "example",

      async initialize() {
        throw error;
      }
    };

    stateManager.register(plugin.id);

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    await assert.rejects(
      initializePlugin(
        plugin,
        {},
        stateManager
      ),
      error
    );

    const failure =
      stateManager.getFailure(
        plugin.id
      );

    assert.ok(failure);

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
      "initialize"
    );

    assert.equal(
      failure.getState(),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("stores start failure details", async () => {
    const stateManager =
      new RuntimePluginStateManager();

    const error = new Error(
      "Start failed"
    );

    const plugin = {
      id: "example",

      async start() {
        throw error;
      }
    };

    stateManager.register(plugin.id);

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );

    await assert.rejects(
      startPlugin(
        plugin,
        {},
        stateManager
      ),
      error
    );

    const failure =
      stateManager.getFailure(
        plugin.id
      );

    assert.ok(failure);

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

  test("stores stop failure details", async () => {
    const stateManager =
      new RuntimePluginStateManager();

    const error = new Error(
      "Stop failed"
    );

    const plugin = {
      id: "example",

      async stop() {
        throw error;
      }
    };

    stateManager.register(plugin.id);

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STARTING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STARTED
    );

    await assert.rejects(
      stopPlugin(
        plugin,
        {},
        stateManager
      ),
      error
    );

    const failure =
      stateManager.getFailure(
        plugin.id
      );

    assert.ok(failure);

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
      "stop"
    );

    assert.equal(
      failure.getState(),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("stores uninstall failure details", async () => {
    const stateManager =
      new RuntimePluginStateManager();

    const error = new Error(
      "Uninstall failed"
    );

    const plugin = {
      id: "example",

      async uninstall() {
        throw error;
      }
    };

    stateManager.register(plugin.id);

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INSTALLED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.INITIALIZED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STARTING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STARTED
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STOPPING
    );

    stateManager.transition(
      plugin.id,
      RUNTIME_PLUGIN_STATES.STOPPED
    );

    await assert.rejects(
      uninstallPlugin(
        plugin,
        {},
        stateManager
      ),
      error
    );

    const failure =
      stateManager.getFailure(
        plugin.id
      );

    assert.ok(failure);

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
      "uninstall"
    );

    assert.equal(
      failure.getState(),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });
});