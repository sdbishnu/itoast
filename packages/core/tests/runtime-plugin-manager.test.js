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


describe("Runtime Plugin Manager", () => {
  test("creates a plugin manager", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    assert.ok(manager);
  });

  test("registers a plugin", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    const plugin = {
      id: "example"
    };

    assert.equal(
      manager.register(plugin),
      plugin
    );

    assert.equal(
      manager.get("example"),
      plugin
    );

    assert.equal(
      manager.getState("example"),
      RUNTIME_PLUGIN_STATES.REGISTERED
    );
  });

  test("checks whether a plugin exists", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    assert.equal(
      manager.has("example"),
      false
    );

    manager.register({
      id: "example"
    });

    assert.equal(
      manager.has("example"),
      true
    );
  });

  test("returns all plugins", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    const first = {
      id: "first"
    };

    const second = {
      id: "second"
    };

    manager.register(first);
    manager.register(second);

    assert.deepEqual(
      manager.getAll(),
      [
        first,
        second
      ]
    );
  });

  test("unregisters a plugin", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    manager.register({
      id: "example"
    });

    assert.equal(
      manager.unregister("example"),
      true
    );

    assert.equal(
      manager.has("example"),
      false
    );

    assert.equal(
      manager.getState("example"),
      undefined
    );
  });

  test("resolves plugins by dependency order", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    const core = {
      id: "core"
    };

    const theme = {
      id: "theme",
      dependencies: ["core"]
    };

    const ui = {
      id: "ui",
      dependencies: ["theme"]
    };

    manager.register(ui);
    manager.register(theme);
    manager.register(core);

    assert.deepEqual(
      manager.resolve(),
      [
        core,
        theme,
        ui
      ]
    );
  });

  test("installs plugins in dependency order", async () => {
    const execution = [];

    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    manager.register({
      id: "ui",
      dependencies: ["theme"],

      async install() {
        execution.push("ui");
      }
    });

    manager.register({
      id: "theme",
      dependencies: ["core"],

      async install() {
        execution.push("theme");
      }
    });

    manager.register({
      id: "core",

      async install() {
        execution.push("core");
      }
    });

    await manager.install({});

    assert.deepEqual(
      execution,
      [
        "core",
        "theme",
        "ui"
      ]
    );
  });

  test("initializes plugins in dependency order", async () => {
    const execution = [];

    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    manager.register({
      id: "feature",
      dependencies: ["core"],

      async initialize() {
        execution.push("feature");
      }
    });

    manager.register({
      id: "core",

      async initialize() {
        execution.push("core");
      }
    });

    await manager.install({});
    await manager.initialize({});

    assert.deepEqual(
      execution,
      [
        "core",
        "feature"
      ]
    );
  });

  test("starts plugins in dependency order", async () => {
    const execution = [];

    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    manager.register({
      id: "feature",
      dependencies: ["core"],

      async start() {
        execution.push("feature");
      }
    });

    manager.register({
      id: "core",

      async start() {
        execution.push("core");
      }
    });

    await manager.install({});
    await manager.initialize({});
    await manager.start({});

    assert.deepEqual(
      execution,
      [
        "core",
        "feature"
      ]
    );
  });

  test("stops plugins in reverse dependency order", async () => {
    const execution = [];

    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    manager.register({
      id: "core",

      async stop() {
        execution.push("core");
      }
    });

    manager.register({
      id: "feature",
      dependencies: ["core"],

      async stop() {
        execution.push("feature");
      }
    });

    await manager.install({});
    await manager.initialize({});
    await manager.start({});
    await manager.stop({});

    assert.deepEqual(
      execution,
      [
        "feature",
        "core"
      ]
    );
  });

  test("uninstalls plugins in reverse dependency order", async () => {
    const execution = [];

    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    manager.register({
      id: "core",

      async uninstall() {
        execution.push("core");
      }
    });

    manager.register({
      id: "feature",
      dependencies: ["core"],

      async uninstall() {
        execution.push("feature");
      }
    });

    await manager.install({});
    await manager.initialize({});
    await manager.start({});
    await manager.stop({});
    await manager.uninstall({});

    assert.deepEqual(
      execution,
      [
        "feature",
        "core"
      ]
    );
  });

  test("exposes plugin states", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    manager.register({
      id: "example"
    });

    const states = manager.getStates();

    assert.equal(
      states.get("example"),
      RUNTIME_PLUGIN_STATES.REGISTERED
    );
  });

  test("exposes registry", () => {
    const registry = new RuntimePluginRegistry();

    const manager = new RuntimePluginManager({
      registry
    });

    assert.equal(
      manager.getRegistry(),
      registry
    );
  });

  test("exposes dependency resolver", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    assert.ok(
      manager.getDependencyResolver()
    );
  });

  test("exposes state manager", () => {
    const manager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    assert.ok(
      manager.getStateManager()
    );
  });
    test("registers plugins as enabled", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "example"
    });

    assert.equal(
      manager.isEnabled("example"),
      true
    );

    assert.equal(
      manager.isDisabled("example"),
      false
    );
  });

  test("disables a registered plugin", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "example"
    });

    assert.equal(
      manager.disable("example"),
      "disabled"
    );

    assert.equal(
      manager.isDisabled("example"),
      true
    );

    assert.equal(
      manager.isEnabled("example"),
      false
    );
  });

  test("enables a disabled plugin", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "example"
    });

    manager.disable("example");

    assert.equal(
      manager.enable("example"),
      "enabled"
    );

    assert.equal(
      manager.isEnabled("example"),
      true
    );
  });

  test("disabled plugins remain registered", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "example"
    });

    manager.disable("example");

    assert.equal(
      manager.has("example"),
      true
    );

    assert.equal(
      manager.get("example").id,
      "example"
    );
  });

  test("disabled plugins are excluded from enabled plugins", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "enabled"
    });

    manager.register({
      id: "disabled"
    });

    manager.disable("disabled");

    assert.deepEqual(
      manager.getEnabledPlugins().map(
        plugin => plugin.id
      ),
      [
        "enabled"
      ]
    );
  });

  test("disabled plugins are returned separately", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "enabled"
    });

    manager.register({
      id: "disabled"
    });

    manager.disable("disabled");

    assert.deepEqual(
      manager.getDisabledPlugins().map(
        plugin => plugin.id
      ),
      [
        "disabled"
      ]
    );
  });

  test("disabled plugin does not execute lifecycle", async () => {
    const execution = [];

    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "disabled",

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

    manager.disable("disabled");

    await manager.install({});
    await manager.initialize({});
    await manager.start({});

    assert.deepEqual(
      execution,
      []
    );
  });

  test("enabled plugin executes lifecycle", async () => {
    const execution = [];

    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
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

    await manager.install({});
    await manager.initialize({});
    await manager.start({});

    assert.deepEqual(
      execution,
      [
        "install",
        "initialize",
        "start"
      ]
    );
  });

  test("rejects disabling an unknown plugin", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    assert.throws(
      () => manager.disable("unknown"),
      /Plugin is not registered/
    );
  });

  test("rejects enabling an unknown plugin", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    assert.throws(
      () => manager.enable("unknown"),
      /Plugin is not registered/
    );
  });

  test("exposes status manager", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    assert.ok(
      manager.getStatusManager()
    );
  });
    test("records dependency failure when dependency fails", async () => {
    const execution = [];

    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    const coreError =
      new Error("Core failed");

    manager.register({
      id: "core",

      async install() {
        throw coreError;
      }
    });

    manager.register({
      id: "theme",
      dependencies: ["core"],

      async install() {
        execution.push("theme");
      }
    });

    await assert.rejects(
      manager.install({}),
      coreError
    );

    assert.deepEqual(
      execution,
      []
    );

    assert.equal(
      manager.hasDependencyFailure(
        "theme"
      ),
      true
    );

    const failure =
      manager.getDependencyFailure(
        "theme"
      );

    assert.equal(
      failure.getPluginId(),
      "theme"
    );

    assert.equal(
      failure.getDependencyId(),
      "core"
    );
  });

  test("dependent plugin does not execute when dependency failed", async () => {
    const execution = [];

    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "core",

      async install() {
        throw new Error(
          "Core failed"
        );
      }
    });

    manager.register({
      id: "theme",
      dependencies: ["core"],

      async install() {
        execution.push("theme");
      }
    });

    await assert.rejects(
      manager.install({}),
      /Core failed/
    );

    assert.deepEqual(
      execution,
      []
    );

    assert.equal(
      manager.hasDependencyFailure(
        "theme"
      ),
      true
    );
  });

  test("independent plugin continues when dependency fails", async () => {
    const execution = [];

    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    manager.register({
      id: "core",

      async install() {
        throw new Error(
          "Core failed"
        );
      }
    });

    manager.register({
      id: "theme",
      dependencies: ["core"],

      async install() {
        execution.push("theme");
      }
    });

    manager.register({
      id: "logger",

      async install() {
        execution.push("logger");
      }
    });

    await assert.rejects(
      manager.install({}),
      /Core failed/
    );

    assert.deepEqual(
      execution,
      ["logger"]
    );
  });

  test("returns dependency failure manager", () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    assert.ok(
      manager.getDependencyFailureManager()
    );
  });

  test("returns all dependency failures", async () => {
    const manager =
      new RuntimePluginManager({
        registry:
          new RuntimePluginRegistry()
      });

    const coreError =
      new Error("Core failed");

    manager.register({
      id: "core",

      async install() {
        throw coreError;
      }
    });

    manager.register({
      id: "theme",
      dependencies: ["core"]
    });

    await assert.rejects(
      manager.install({}),
      coreError
    );

    const failures =
      manager.getDependencyFailures();

    assert.equal(
      failures.has("theme"),
      true
    );
  });

});