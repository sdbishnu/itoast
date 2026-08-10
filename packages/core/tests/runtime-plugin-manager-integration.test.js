import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  ItoastRuntime,
  RUNTIME_PLUGIN_STATES,
  RUNTIME_STATES
} from "../src/index.js";

describe("Runtime Plugin Manager Integration", () => {
  test("runtime exposes the plugin manager", () => {
    const runtime = new ItoastRuntime();

    assert.ok(
      runtime.getPluginManager()
    );
  });

  test("runtime uses the plugin manager for registration", () => {
    const runtime = new ItoastRuntime();

    const plugin = {
      id: "example"
    };

    runtime.registerPlugin(plugin);

    assert.equal(
      runtime.getPluginManager().get("example"),
      plugin
    );

    assert.equal(
      runtime.getPluginState("example"),
      RUNTIME_PLUGIN_STATES.REGISTERED
    );
  });

  test("runtime starts plugins through the manager", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "core",

      async install() {
        execution.push("install");
      },

      async initialize() {
        execution.push("initialize");
      },

      async start() {
        execution.push("start");
      }
    });

    await runtime.start();

    assert.deepEqual(
      execution,
      [
        "install",
        "initialize",
        "start"
      ]
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.RUNNING
    );

    assert.equal(
      runtime.getPluginState("core"),
      RUNTIME_PLUGIN_STATES.STARTED
    );
  });

  test("runtime stops plugins through the manager", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "core",

      async stop() {
        execution.push("stop");
      },

      async uninstall() {
        execution.push("uninstall");
      }
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(
      execution,
      [
        "stop",
        "uninstall"
      ]
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.STOPPED
    );

    assert.equal(
      runtime.getPluginState("core"),
      RUNTIME_PLUGIN_STATES.UNINSTALLED
    );
  });

  test("runtime preserves plugin dependency ordering", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "ui",
      dependencies: ["theme"],

      async start() {
        execution.push("ui");
      }
    });

    runtime.registerPlugin({
      id: "theme",
      dependencies: ["core"],

      async start() {
        execution.push("theme");
      }
    });

    runtime.registerPlugin({
      id: "core",

      async start() {
        execution.push("core");
      }
    });

    await runtime.start();

    assert.deepEqual(
      execution,
      [
        "core",
        "theme",
        "ui"
      ]
    );
  });

  test("runtime preserves reverse dependency ordering on shutdown", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "core",

      async stop() {
        execution.push("core");
      }
    });

    runtime.registerPlugin({
      id: "theme",
      dependencies: ["core"],

      async stop() {
        execution.push("theme");
      }
    });

    runtime.registerPlugin({
      id: "ui",
      dependencies: ["theme"],

      async stop() {
        execution.push("ui");
      }
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(
      execution,
      [
        "ui",
        "theme",
        "core"
      ]
    );
  });

  test("runtime plugin manager preserves startup pipeline ordering", async () => {
    const execution = [];

    const runtime = new ItoastRuntime({
      startupStages: [
        async () => {
          execution.push("runtime-startup");
        }
      ]
    });

    runtime.registerPlugin({
      id: "core",

      async install() {
        execution.push("install");
      },

      async initialize() {
        execution.push("initialize");
      },

      async start() {
        execution.push("start");
      }
    });

    await runtime.start();

    assert.deepEqual(
      execution,
      [
        "install",
        "initialize",
        "runtime-startup",
        "start"
      ]
    );
  });

  test("runtime plugin manager preserves shutdown pipeline ordering", async () => {
    const execution = [];

    const runtime = new ItoastRuntime({
      shutdownStages: [
        async () => {
          execution.push("runtime-shutdown");
        }
      ]
    });

    runtime.registerPlugin({
      id: "core",

      async stop() {
        execution.push("stop");
      },

      async uninstall() {
        execution.push("uninstall");
      }
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(
      execution,
      [
        "stop",
        "runtime-shutdown",
        "uninstall"
      ]
    );
  });

  test("runtime exposes the same registry through the manager", () => {
    const runtime = new ItoastRuntime();

    assert.equal(
      runtime.getPluginRegistry(),
      runtime.getPluginManager().getRegistry()
    );
  });

  test("runtime exposes the same state manager through the manager", () => {
    const runtime = new ItoastRuntime();

    assert.equal(
      runtime.getPluginStateManager(),
      runtime.getPluginManager().getStateManager()
    );
  });

  test("runtime exposes the same dependency resolver through the manager", () => {
    const runtime = new ItoastRuntime();

    assert.equal(
      runtime.getPluginDependencyResolver(),
      runtime
        .getPluginManager()
        .getDependencyResolver()
    );
  });
});