import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  validatePluginDefinition,
  createPluginDefinition
} from "../src/plugin/runtime-plugin-definition.js";

describe("Runtime Plugin Definition", () => {
  test("accepts a valid plugin", () => {
    const plugin = {
      id: "example",
      name: "Example Plugin",
      version: "1.0.0",
      description: "Example plugin."
    };

    assert.equal(
      validatePluginDefinition(plugin),
      true
    );
  });

  test("requires a plugin object", () => {
    assert.throws(
      () => validatePluginDefinition(null),
      TypeError
    );

    assert.throws(
      () => validatePluginDefinition("plugin"),
      TypeError
    );
  });

  test("requires a non-empty plugin id", () => {
    assert.throws(
      () => validatePluginDefinition({}),
      TypeError
    );

    assert.throws(
      () =>
        validatePluginDefinition({
          id: ""
        }),
      TypeError
    );

    assert.throws(
      () =>
        validatePluginDefinition({
          id: "   "
        }),
      TypeError
    );
  });

  test("validates plugin name", () => {
    assert.throws(
      () =>
        validatePluginDefinition({
          id: "example",
          name: 123
        }),
      TypeError
    );
  });

  test("validates plugin version", () => {
    assert.throws(
      () =>
        validatePluginDefinition({
          id: "example",
          version: 123
        }),
      TypeError
    );
  });

  test("validates plugin description", () => {
    assert.throws(
      () =>
        validatePluginDefinition({
          id: "example",
          description: 123
        }),
      TypeError
    );
  });

  test("validates lifecycle methods", () => {
    const methods = [
      "install",
      "initialize",
      "start",
      "stop",
      "uninstall"
    ];

    for (const method of methods) {
      assert.throws(
        () =>
          validatePluginDefinition({
            id: "example",
            [method]: true
          }),
        TypeError
      );
    }
  });

  test("accepts optional lifecycle methods", () => {
    const plugin = {
      id: "example",

      async install() {},

      async initialize() {},

      async start() {},

      async stop() {},

      async uninstall() {}
    };

    assert.equal(
      validatePluginDefinition(plugin),
      true
    );
  });

  test("creates normalized plugin metadata", () => {
    const definition =
      createPluginDefinition({
        id: "example",
        name: "Example Plugin",
        version: "1.2.0",
        description: "Example."
      });

    assert.deepEqual(
      definition,
      {
        id: "example",
        name: "Example Plugin",
        version: "1.2.0",
        description: "Example.",
        dependencies: []
      }
    );
  });

  test("creates default metadata", () => {
    const definition =
      createPluginDefinition({
        id: "example"
      });

    assert.deepEqual(
      definition,
      {
        id: "example",
        name: "example",
        version: "0.1.0",
        description: "",
        dependencies: []
      }
    );
  });

  test("plugin metadata is immutable", () => {
    const definition =
      createPluginDefinition({
        id: "example"
      });

    assert.equal(
      Object.isFrozen(definition),
      true
    );
  });

  test("accepts plugin dependencies", () => {
    const plugin = {
      id: "example",
      dependencies: [
        "core",
        "events"
      ]
    };

    assert.equal(
      validatePluginDefinition(plugin),
      true
    );
  });

  test("rejects non-array dependencies", () => {
    assert.throws(
      () =>
        validatePluginDefinition({
          id: "example",
          dependencies: "core"
        }),
      TypeError
    );
  });

  test("rejects empty dependency ids", () => {
    assert.throws(
      () =>
        validatePluginDefinition({
          id: "example",
          dependencies: [""]
        }),
      TypeError
    );
  });

  test("rejects invalid dependency ids", () => {
    assert.throws(
      () =>
        validatePluginDefinition({
          id: "example",
          dependencies: [123]
        }),
      TypeError
    );
  });

  test("rejects duplicate dependencies", () => {
    assert.throws(
      () =>
        validatePluginDefinition({
          id: "example",
          dependencies: [
            "core",
            "core"
          ]
        }),
      TypeError
    );
  });

  test("rejects self dependency", () => {
    assert.throws(
      () =>
        validatePluginDefinition({
          id: "example",
          dependencies: [
            "example"
          ]
        }),
      TypeError
    );
  });

  test("creates immutable dependency metadata", () => {
    const definition =
      createPluginDefinition({
        id: "example",
        dependencies: [
          "core",
          "events"
        ]
      });

    assert.deepEqual(
      definition.dependencies,
      [
        "core",
        "events"
      ]
    );

    assert.equal(
      Object.isFrozen(
        definition.dependencies
      ),
      true
    );
  });

  test("does not share dependency array with plugin", () => {
    const dependencies = [
      "core"
    ];

    const definition =
      createPluginDefinition({
        id: "example",
        dependencies
      });

    dependencies.push("events");

    assert.deepEqual(
      definition.dependencies,
      ["core"]
    );
  });
});