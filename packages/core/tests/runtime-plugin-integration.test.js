import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  ItoastRuntime,
  RUNTIME_STATES
} from "../src/index.js";

describe("Runtime Plugin Integration", () => {
  test("runtime creates an empty plugin registry", () => {
    const runtime = new ItoastRuntime();

    assert.deepEqual(
      runtime.getPlugins(),
      []
    );
  });

  test("runtime registers a plugin", () => {
    const runtime = new ItoastRuntime();

    const plugin = {
      id: "example"
    };

    const result =
      runtime.registerPlugin(plugin);

    assert.equal(result, plugin);
    assert.equal(
      runtime.hasPlugin("example"),
      true
    );
  });

  test("runtime retrieves a registered plugin", () => {
    const runtime = new ItoastRuntime();

    const plugin = {
      id: "example"
    };

    runtime.registerPlugin(plugin);

    assert.equal(
      runtime.getPlugin("example"),
      plugin
    );
  });

  test("runtime returns all registered plugins", () => {
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
      [first, second]
    );
  });

  test("runtime unregisters a plugin", () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    assert.equal(
      runtime.unregisterPlugin("example"),
      true
    );

    assert.equal(
      runtime.hasPlugin("example"),
      false
    );
  });

  test("runtime exposes the plugin registry", () => {
    const runtime = new ItoastRuntime();

    assert.ok(
      runtime.getPluginRegistry()
    );
  });

  test("plugin registration does not change runtime state", () => {
    const runtime = new ItoastRuntime();

    runtime.registerPlugin({
      id: "example"
    });

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.CREATED
    );
  });
});