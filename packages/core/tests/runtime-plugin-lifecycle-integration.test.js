import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  ItoastRuntime,
  RUNTIME_STATES
} from "../src/index.js";

describe("Runtime Plugin Lifecycle Integration", () => {
  test("runtime installs plugins during startup", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async install() {
        execution.push("install");
      }
    });

    await runtime.start();

    assert.deepEqual(
      execution,
      ["install"]
    );
  });

  test("runtime initializes plugins during startup", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async initialize() {
        execution.push("initialize");
      }
    });

    await runtime.start();

    assert.deepEqual(
      execution,
      ["initialize"]
    );
  });

  test("runtime starts plugins during startup", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async start() {
        execution.push("start");
      }
    });

    await runtime.start();

    assert.deepEqual(
      execution,
      ["start"]
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.RUNNING
    );
  });

  test("runtime executes plugin lifecycle in order", async () => {
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
  });

  test("runtime stops plugins during shutdown", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async stop() {
        execution.push("stop");
      }
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(
      execution,
      ["stop"]
    );
  });

  test("runtime uninstalls plugins during shutdown", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async uninstall() {
        execution.push("uninstall");
      }
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(
      execution,
      ["uninstall"]
    );
  });

  test("runtime executes shutdown lifecycle in order", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

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
  });

  test("runtime preserves plugin startup errors", async () => {
    const pluginError = new Error(
      "Plugin startup failed"
    );

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async start() {
        throw pluginError;
      }
    });

    await assert.rejects(
      runtime.start(),
      (error) => error === pluginError
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.FAILED
    );
  });

  test("runtime preserves plugin shutdown errors", async () => {
    const pluginError = new Error(
      "Plugin shutdown failed"
    );

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async stop() {
        throw pluginError;
      }
    });

    await runtime.start();

    await assert.rejects(
      runtime.stop(),
      (error) => error === pluginError
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.FAILED
    );
  });

  test("runtime passes startup context to plugins", async () => {
    let receivedContext;

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async start(context) {
        receivedContext = context;
      }
    });

    await runtime.start();

    assert.equal(
      receivedContext.runtime,
      runtime
    );

    assert.equal(
      receivedContext.context,
      runtime.getContext()
    );

    assert.equal(
      receivedContext.options,
      runtime.getOptions()
    );
  });

  test("runtime passes shutdown context to plugins", async () => {
    let receivedContext;

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example",

      async stop(context) {
        receivedContext = context;
      }
    });

    await runtime.start();
    await runtime.stop();

    assert.equal(
      receivedContext.runtime,
      runtime
    );

    assert.equal(
      receivedContext.context,
      runtime.getContext()
    );

    assert.equal(
      receivedContext.options,
      runtime.getOptions()
    );
  });

  test("runtime stops plugins in reverse registration order", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "first",

      async stop() {
        execution.push("first");
      }
    });

    runtime.registerPlugin({
      id: "second",

      async stop() {
        execution.push("second");
      }
    });

    runtime.registerPlugin({
      id: "third",

      async stop() {
        execution.push("third");
      }
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(
      execution,
      [
        "third",
        "second",
        "first"
      ]
    );
  });

  test("runtime uninstalls plugins in reverse registration order", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "first",

      async uninstall() {
        execution.push("first");
      }
    });

    runtime.registerPlugin({
      id: "second",

      async uninstall() {
        execution.push("second");
      }
    });

    runtime.registerPlugin({
      id: "third",

      async uninstall() {
        execution.push("third");
      }
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(
      execution,
      [
        "third",
        "second",
        "first"
      ]
    );
  });
});