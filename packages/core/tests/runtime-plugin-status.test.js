import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  RUNTIME_PLUGIN_STATUS,
  isValidPluginStatus
} from "../src/plugin/runtime-plugin-status.js";

import {
  RuntimePluginStatusManager
} from "../src/plugin/runtime-plugin-status-manager.js";

describe("Runtime Plugin Status", () => {
  test("defines enabled status", () => {
    assert.equal(
      RUNTIME_PLUGIN_STATUS.ENABLED,
      "enabled"
    );
  });

  test("defines disabled status", () => {
    assert.equal(
      RUNTIME_PLUGIN_STATUS.DISABLED,
      "disabled"
    );
  });

  test("validates enabled status", () => {
    assert.equal(
      isValidPluginStatus(
        RUNTIME_PLUGIN_STATUS.ENABLED
      ),
      true
    );
  });

  test("validates disabled status", () => {
    assert.equal(
      isValidPluginStatus(
        RUNTIME_PLUGIN_STATUS.DISABLED
      ),
      true
    );
  });

  test("rejects invalid status", () => {
    assert.equal(
      isValidPluginStatus("invalid"),
      false
    );
  });

  test("registers plugins as enabled", () => {
    const manager =
      new RuntimePluginStatusManager();

    manager.register("example");

    assert.equal(
      manager.get("example"),
      RUNTIME_PLUGIN_STATUS.ENABLED
    );
  });

  test("enables a plugin", () => {
    const manager =
      new RuntimePluginStatusManager();

    manager.register("example");
    manager.disable("example");
    manager.enable("example");

    assert.equal(
      manager.isEnabled("example"),
      true
    );
  });

  test("disables a plugin", () => {
    const manager =
      new RuntimePluginStatusManager();

    manager.register("example");
    manager.disable("example");

    assert.equal(
      manager.isDisabled("example"),
      true
    );

    assert.equal(
      manager.isEnabled("example"),
      false
    );
  });

  test("enable returns enabled status", () => {
    const manager =
      new RuntimePluginStatusManager();

    manager.register("example");
    manager.disable("example");

    assert.equal(
      manager.enable("example"),
      RUNTIME_PLUGIN_STATUS.ENABLED
    );
  });

  test("disable returns disabled status", () => {
    const manager =
      new RuntimePluginStatusManager();

    manager.register("example");

    assert.equal(
      manager.disable("example"),
      RUNTIME_PLUGIN_STATUS.DISABLED
    );
  });

  test("checks registered plugin", () => {
    const manager =
      new RuntimePluginStatusManager();

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

  test("returns all plugin statuses", () => {
    const manager =
      new RuntimePluginStatusManager();

    manager.register("first");
    manager.register("second");

    manager.disable("second");

    const statuses =
      manager.getAll();

    assert.equal(
      statuses.get("first"),
      RUNTIME_PLUGIN_STATUS.ENABLED
    );

    assert.equal(
      statuses.get("second"),
      RUNTIME_PLUGIN_STATUS.DISABLED
    );
  });

  test("unregister removes plugin status", () => {
    const manager =
      new RuntimePluginStatusManager();

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

  test("rejects enabling an unknown plugin", () => {
    const manager =
      new RuntimePluginStatusManager();

    assert.throws(
      () => manager.enable("example"),
      /Plugin is not registered/
    );
  });

  test("rejects disabling an unknown plugin", () => {
    const manager =
      new RuntimePluginStatusManager();

    assert.throws(
      () => manager.disable("example"),
      /Plugin is not registered/
    );
  });

  test("rejects an invalid plugin ID", () => {
    const manager =
      new RuntimePluginStatusManager();

    assert.throws(
      () => manager.register(""),
      TypeError
    );
  });

  test("clear removes all statuses", () => {
    const manager =
      new RuntimePluginStatusManager();

    manager.register("first");
    manager.register("second");

    manager.clear();

    assert.equal(
      manager.has("first"),
      false
    );

    assert.equal(
      manager.has("second"),
      false
    );
  });
});