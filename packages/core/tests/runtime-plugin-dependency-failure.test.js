import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  RuntimePluginDependencyFailure
} from "../src/plugin/runtime-plugin-dependency-failure.js";

import {
  RuntimePluginDependencyFailureManager
} from "../src/plugin/runtime-plugin-dependency-failure-manager.js";

describe("Runtime Plugin Dependency Failure", () => {
  test("creates dependency failure information", () => {
    const dependencyFailure = new Error(
      "Core plugin failed"
    );

    const failure =
      new RuntimePluginDependencyFailure(
        "theme",
        "core",
        dependencyFailure
      );

    assert.equal(
      failure.getPluginId(),
      "theme"
    );

    assert.equal(
      failure.getDependencyId(),
      "core"
    );

    assert.equal(
      failure.getDependencyFailure(),
      dependencyFailure
    );
  });

  test("dependency failure is immutable", () => {
    const failure =
      new RuntimePluginDependencyFailure(
        "theme",
        "core",
        new Error("Failed")
      );

    assert.equal(
      Object.isFrozen(failure),
      true
    );
  });

  test("records dependency failure", () => {
    const manager =
      new RuntimePluginDependencyFailureManager();

    const dependencyFailure = new Error(
      "Core failed"
    );

    const failure =
      manager.record(
        "theme",
        "core",
        dependencyFailure
      );

    assert.equal(
      failure.getPluginId(),
      "theme"
    );

    assert.equal(
      failure.getDependencyId(),
      "core"
    );

    assert.equal(
      failure.getDependencyFailure(),
      dependencyFailure
    );
  });

  test("checks dependency failure", () => {
    const manager =
      new RuntimePluginDependencyFailureManager();

    manager.record(
      "theme",
      "core",
      new Error("Core failed")
    );

    assert.equal(
      manager.has("theme"),
      true
    );

    assert.equal(
      manager.has("core"),
      false
    );
  });

  test("returns dependency failure", () => {
    const manager =
      new RuntimePluginDependencyFailureManager();

    const dependencyFailure = new Error(
      "Core failed"
    );

    manager.record(
      "theme",
      "core",
      dependencyFailure
    );

    const failure =
      manager.get("theme");

    assert.equal(
      failure.getPluginId(),
      "theme"
    );

    assert.equal(
      failure.getDependencyId(),
      "core"
    );

    assert.equal(
      failure.getDependencyFailure(),
      dependencyFailure
    );
  });

  test("returns all dependency failures", () => {
    const manager =
      new RuntimePluginDependencyFailureManager();

    manager.record(
      "theme",
      "core",
      new Error("Core failed")
    );

    manager.record(
      "ui",
      "theme",
      new Error("Theme unavailable")
    );

    const failures =
      manager.getAll();

    assert.equal(
      failures.size,
      2
    );

    assert.equal(
      failures.has("theme"),
      true
    );

    assert.equal(
      failures.has("ui"),
      true
    );
  });

  test("clears one dependency failure", () => {
    const manager =
      new RuntimePluginDependencyFailureManager();

    manager.record(
      "theme",
      "core",
      new Error("Core failed")
    );

    manager.record(
      "ui",
      "theme",
      new Error("Theme failed")
    );

    manager.clear("theme");

    assert.equal(
      manager.has("theme"),
      false
    );

    assert.equal(
      manager.has("ui"),
      true
    );
  });

  test("clears all dependency failures", () => {
    const manager =
      new RuntimePluginDependencyFailureManager();

    manager.record(
      "theme",
      "core",
      new Error("Core failed")
    );

    manager.record(
      "ui",
      "theme",
      new Error("Theme failed")
    );

    manager.clearAll();

    assert.equal(
      manager.getAll().size,
      0
    );
  });

  test("clear without an ID clears all failures", () => {
    const manager =
      new RuntimePluginDependencyFailureManager();

    manager.record(
      "theme",
      "core",
      new Error("Core failed")
    );

    manager.clear();

    assert.equal(
      manager.getAll().size,
      0
    );
  });
});