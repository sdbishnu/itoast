import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  ItoastRuntime
} from "../src/index.js";

describe("Runtime Plugin API", () => {
  test("registers a plugin through runtime", () => {
    const runtime = new ItoastRuntime();

    const plugin = {
      id: "example"
    };

    assert.equal(
      runtime.registerPlugin(plugin),
      plugin
    );

    assert.equal(
      runtime.hasPlugin("example"),
      true
    );

    assert.equal(
      runtime.getPlugin("example"),
      plugin
    );
  });

  test("returns all registered plugins", () => {
    const runtime = new ItoastRuntime();

    const first = {
      id: "first"
    };

    const second = {
      id: "second"
    };

    runtime.registerPlugin(first);
    runtime.registerPlugin(second);

    assert.deepEqual(
      runtime.getPlugins(),
      [
        first,
        second
      ]
    );
  });

  test("enables a plugin through runtime", () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    runtime.disablePlugin(
      "example"
    );

    assert.equal(
      runtime.enablePlugin(
        "example"
      ),
      "enabled"
    );

    assert.equal(
      runtime.isPluginEnabled(
        "example"
      ),
      true
    );

    assert.equal(
      runtime.isPluginDisabled(
        "example"
      ),
      false
    );
  });

  test("disables a plugin through runtime", () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    assert.equal(
      runtime.disablePlugin(
        "example"
      ),
      "disabled"
    );

    assert.equal(
      runtime.isPluginDisabled(
        "example"
      ),
      true
    );

    assert.equal(
      runtime.isPluginEnabled(
        "example"
      ),
      false
    );
  });

  test("disabled plugin remains registered", () => {
    const runtime = new ItoastRuntime();

    const plugin = {
      id: "example"
    };

    runtime.registerPlugin(plugin);

    runtime.disablePlugin(
      "example"
    );

    assert.equal(
      runtime.hasPlugin("example"),
      true
    );

    assert.equal(
      runtime.getPlugin("example"),
      plugin
    );
  });

  test("returns plugin status", () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    assert.equal(
      runtime.getPluginStatus(
        "example"
      ),
      "enabled"
    );

    runtime.disablePlugin(
      "example"
    );

    assert.equal(
      runtime.getPluginStatus(
        "example"
      ),
      "disabled"
    );
  });

  test("returns all plugin statuses", () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "first"
    });

    runtime.registerPlugin({
      id: "second"
    });

    runtime.disablePlugin(
      "second"
    );

    const statuses =
      runtime.getPluginStatuses();

    assert.equal(
      statuses.get("first"),
      "enabled"
    );

    assert.equal(
      statuses.get("second"),
      "disabled"
    );
  });

  test("exposes plugin status manager", () => {
    const runtime = new ItoastRuntime();

    assert.ok(
      runtime.getPluginStatusManager()
    );

    assert.equal(
      runtime.getPluginStatusManager(),
      runtime
        .getPluginManager()
        .getStatusManager()
    );
  });

  test("rejects enabling an unknown plugin", () => {
    const runtime = new ItoastRuntime();

    assert.throws(
      () => runtime.enablePlugin(
        "unknown"
      ),
      /Plugin is not registered/
    );
  });

  test("rejects disabling an unknown plugin", () => {
    const runtime = new ItoastRuntime();

    assert.throws(
      () => runtime.disablePlugin(
        "unknown"
      ),
      /Plugin is not registered/
    );
  });

  test("disabled plugin does not execute during runtime start", async () => {
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

    runtime.disablePlugin(
      "example"
    );

    await runtime.start();

    assert.deepEqual(
      execution,
      []
    );
  });

  test("enabled plugin executes during runtime start", async () => {
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
});