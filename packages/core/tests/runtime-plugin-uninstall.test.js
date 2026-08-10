import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  RuntimePluginManager
} from "../src/plugin/runtime-plugin-manager.js";

import {
  RuntimePluginRegistry
} from "../src/plugin/runtime-plugin-registry.js";

import {
  RUNTIME_PLUGIN_STATES
} from "../src/plugin/runtime-plugin-state.js";

import {
  ItoastRuntime
} from "../src/index.js";

describe("Runtime Plugin Uninstall", () => {
  test("uninstalls a registered plugin", async () => {
    const execution = [];

    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "example",

      async uninstall() {
        execution.push("uninstall");
      }
    });

    await manager.install({});
    await manager.initialize({});
    await manager.start({});
    await manager.stop({});
    await manager.uninstall({});

    assert.deepEqual(
      execution,
      ["uninstall"]
    );

    assert.equal(
      manager.getState("example"),
      RUNTIME_PLUGIN_STATES.UNINSTALLED
    );
  });

  test("uninstalls a specific plugin", async () => {
    const execution = [];

    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "example",

      async uninstall() {
        execution.push("example");
      }
    });

    await manager.install({});
    await manager.initialize({});
    await manager.start({});
    await manager.stop({});

    const plugin =
      await manager.uninstallPlugin(
        "example",
        {}
      );

    assert.equal(
      plugin.id,
      "example"
    );

    assert.deepEqual(
      execution,
      ["example"]
    );

    assert.equal(
      manager.getState("example"),
      RUNTIME_PLUGIN_STATES.UNINSTALLED
    );
  });

  test("passes uninstall context to plugin", async () => {
    let receivedContext;

    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "example",

      async uninstall(context) {
        receivedContext = context;
      }
    });

    await manager.install({});
    await manager.initialize({});
    await manager.start({});
    await manager.stop({});

    const context = {
      value: "test"
    };

    await manager.uninstallPlugin(
      "example",
      context
    );

    assert.equal(
      receivedContext,
      context
    );
  });

  test("rejects uninstalling an unknown plugin", async () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    await assert.rejects(
      manager.uninstallPlugin(
        "unknown",
        {}
      ),
      /Plugin is not registered/
    );
  });

  test("uninstall failure preserves original error", async () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    const error =
      new Error("Uninstall failed");

    manager.register({
      id: "example",

      async uninstall() {
        throw error;
      }
    });

    await manager.install({});
    await manager.initialize({});
    await manager.start({});
    await manager.stop({});

    await assert.rejects(
      manager.uninstallPlugin(
        "example",
        {}
      ),
      error
    );

    assert.equal(
      manager.getState("example"),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("runtime exposes plugin uninstall", async () => {
    const execution = [];

    const runtime =
      new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async uninstall() {
        execution.push("uninstall");
      }
    });

    await runtime.start();

    await runtime.uninstallPlugin(
      "example"
    );

    assert.deepEqual(
      execution,
      ["uninstall"]
    );

    assert.equal(
      runtime.getPluginState("example"),
      RUNTIME_PLUGIN_STATES.UNINSTALLED
    );
  });
});