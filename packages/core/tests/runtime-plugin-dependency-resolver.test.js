import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  RuntimePluginDependencyResolver
} from "../src/plugin/runtime-plugin-dependency-resolver.js";

describe("Runtime Plugin Dependency Resolver", () => {
  test("creates an empty resolution for no plugins", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    assert.deepEqual(
      resolver.resolve([]),
      []
    );
  });

  test("resolves independent plugins in registration order", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    const first = {
      id: "first"
    };

    const second = {
      id: "second"
    };

    const third = {
      id: "third"
    };

    assert.deepEqual(
      resolver.resolve([
        first,
        second,
        third
      ]),
      [
        first,
        second,
        third
      ]
    );
  });

  test("resolves a single dependency", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    const dependency = {
      id: "dependency"
    };

    const plugin = {
      id: "plugin",
      dependencies: [
        "dependency"
      ]
    };

    assert.deepEqual(
      resolver.resolve([
        plugin,
        dependency
      ]),
      [
        dependency,
        plugin
      ]
    );
  });

  test("resolves multiple dependencies", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    const first = {
      id: "first"
    };

    const second = {
      id: "second"
    };

    const plugin = {
      id: "plugin",
      dependencies: [
        "first",
        "second"
      ]
    };

    assert.deepEqual(
      resolver.resolve([
        plugin,
        first,
        second
      ]),
      [
        first,
        second,
        plugin
      ]
    );
  });

  test("resolves a dependency chain", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    const third = {
      id: "third"
    };

    const second = {
      id: "second",
      dependencies: [
        "third"
      ]
    };

    const first = {
      id: "first",
      dependencies: [
        "second"
      ]
    };

    assert.deepEqual(
      resolver.resolve([
        first,
        second,
        third
      ]),
      [
        third,
        second,
        first
      ]
    );
  });

  test("rejects a missing dependency", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    const plugin = {
      id: "plugin",
      dependencies: [
        "missing"
      ]
    };

    assert.throws(
      () => resolver.resolve([plugin]),
      /Missing plugin dependency/
    );
  });

  test("rejects circular dependencies", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    const first = {
      id: "first",
      dependencies: [
        "second"
      ]
    };

    const second = {
      id: "second",
      dependencies: [
        "first"
      ]
    };

    assert.throws(
      () =>
        resolver.resolve([
          first,
          second
        ]),
      /Circular plugin dependency detected/
    );
  });

  test("rejects duplicate plugin ids", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    const first = {
      id: "example"
    };

    const second = {
      id: "example"
    };

    assert.throws(
      () =>
        resolver.resolve([
          first,
          second
        ]),
      /Duplicate plugin id/
    );
  });

  test("rejects invalid plugin collections", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    assert.throws(
      () => resolver.resolve(null),
      TypeError
    );

    assert.throws(
      () => resolver.resolve({}),
      TypeError
    );
  });

  test("preserves plugin objects", () => {
    const resolver =
      new RuntimePluginDependencyResolver();

    const dependency = {
      id: "dependency",
      name: "Dependency Plugin"
    };

    const plugin = {
      id: "plugin",
      dependencies: [
        "dependency"
      ]
    };

    const result =
      resolver.resolve([
        plugin,
        dependency
      ]);

    assert.equal(
      result[0],
      dependency
    );

    assert.equal(
      result[1],
      plugin
    );
  });
});