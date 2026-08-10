import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  ItoastRuntime,
  RUNTIME_PLUGIN_STATES
} from "../src/index.js";

describe("Runtime Plugin State Integration", () => {
  test("runtime exposes the plugin state manager", () => {
    const runtime = new ItoastRuntime();

    assert.ok(
      runtime.getPluginStateManager()
    );
  });

  test("registered plugin starts in REGISTERED state", () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    assert.equal(
      runtime.getPluginState("example"),
      RUNTIME_PLUGIN_STATES.REGISTERED
    );
  });

  test("plugin reaches STARTED state", async () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    await runtime.start();

    assert.equal(
      runtime.getPluginState("example"),
      RUNTIME_PLUGIN_STATES.STARTED
    );
  });

  test("plugin reaches UNINSTALLED state after stop", async () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    await runtime.start();
    await runtime.stop();

    assert.equal(
      runtime.getPluginState("example"),
      RUNTIME_PLUGIN_STATES.UNINSTALLED
    );
  });

  test("plugin lifecycle methods execute in order", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async install() {
        execution.push("install");
      },

      async initialize() {
        execution.push("initialize");
      },

      async start() {
        execution.push("start");
      },

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
        "install",
        "initialize",
        "start",
        "stop",
        "uninstall"
      ]
    );
  });

  test("plugin failure changes plugin state to FAILED", async () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async start() {
        throw new Error(
          "Plugin startup failed"
        );
      }
    });

    await assert.rejects(
      runtime.start(),
      /Plugin startup failed/
    );

    assert.equal(
      runtime.getPluginState("example"),
      RUNTIME_PLUGIN_STATES.FAILED
    );
  });

  test("runtime exposes all plugin states", async () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "first"
    });

    runtime.registerPlugin({
      id: "second"
    });

    await runtime.start();

    const states =
      runtime.getPluginStates();

    assert.equal(
      states.get("first"),
      RUNTIME_PLUGIN_STATES.STARTED
    );

    assert.equal(
      states.get("second"),
      RUNTIME_PLUGIN_STATES.STARTED
    );
  });

  test("unregister removes plugin state", () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    assert.equal(
      runtime.getPluginState("example"),
      RUNTIME_PLUGIN_STATES.REGISTERED
    );

    runtime.unregisterPlugin(
      "example"
    );

    assert.equal(
      runtime.getPluginState("example"),
      undefined
    );
  });
});