import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  ItoastRuntime,
  RUNTIME_STATES
} from "../src/index.js";

describe(
  "Runtime Plugin Dependency Integration",
  () => {
    test(
      "runtime exposes the dependency resolver",
      () => {
        const runtime = new ItoastRuntime();

        assert.ok(
          runtime.getPluginDependencyResolver()
        );
      }
    );

    test(
      "runtime starts plugins in dependency order",
      async () => {
        const execution = [];

        const corePlugin = {
          id: "core",

          async start() {
            execution.push("core");
          }
        };

        const themePlugin = {
          id: "theme",

          dependencies: [
            "core"
          ],

          async start() {
            execution.push("theme");
          }
        };

        const uiPlugin = {
          id: "ui",

          dependencies: [
            "theme"
          ],

          async start() {
            execution.push("ui");
          }
        };

        const runtime = new ItoastRuntime();

        runtime.registerPlugin(uiPlugin);
        runtime.registerPlugin(themePlugin);
        runtime.registerPlugin(corePlugin);

        await runtime.start();

        assert.deepEqual(
          execution,
          [
            "core",
            "theme",
            "ui"
          ]
        );
      }
    );

    test(
      "runtime installs plugins in dependency order",
      async () => {
        const execution = [];

        const corePlugin = {
          id: "core",

          async install() {
            execution.push("core");
          }
        };

        const featurePlugin = {
          id: "feature",

          dependencies: [
            "core"
          ],

          async install() {
            execution.push("feature");
          }
        };

        const runtime = new ItoastRuntime();

        runtime.registerPlugin(featurePlugin);
        runtime.registerPlugin(corePlugin);

        await runtime.start();

        assert.deepEqual(
          execution,
          [
            "core",
            "feature"
          ]
        );
      }
    );

    test(
      "runtime initializes plugins in dependency order",
      async () => {
        const execution = [];

        const corePlugin = {
          id: "core",

          async initialize() {
            execution.push("core");
          }
        };

        const featurePlugin = {
          id: "feature",

          dependencies: [
            "core"
          ],

          async initialize() {
            execution.push("feature");
          }
        };

        const runtime = new ItoastRuntime();

        runtime.registerPlugin(featurePlugin);
        runtime.registerPlugin(corePlugin);

        await runtime.start();

        assert.deepEqual(
          execution,
          [
            "core",
            "feature"
          ]
        );
      }
    );

    test(
      "runtime stops plugins in reverse dependency order",
      async () => {
        const execution = [];

        const corePlugin = {
          id: "core",

          async stop() {
            execution.push("core");
          }
        };

        const themePlugin = {
          id: "theme",

          dependencies: [
            "core"
          ],

          async stop() {
            execution.push("theme");
          }
        };

        const uiPlugin = {
          id: "ui",

          dependencies: [
            "theme"
          ],

          async stop() {
            execution.push("ui");
          }
        };

        const runtime = new ItoastRuntime();

        runtime.registerPlugin(corePlugin);
        runtime.registerPlugin(themePlugin);
        runtime.registerPlugin(uiPlugin);

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
      }
    );

    test(
      "runtime uninstalls plugins in reverse dependency order",
      async () => {
        const execution = [];

        const corePlugin = {
          id: "core",

          async uninstall() {
            execution.push("core");
          }
        };

        const featurePlugin = {
          id: "feature",

          dependencies: [
            "core"
          ],

          async uninstall() {
            execution.push("feature");
          }
        };

        const runtime = new ItoastRuntime();

        runtime.registerPlugin(corePlugin);
        runtime.registerPlugin(featurePlugin);

        await runtime.start();
        await runtime.stop();

        assert.deepEqual(
          execution,
          [
            "feature",
            "core"
          ]
        );
      }
    );

    test(
      "missing dependency prevents runtime startup",
      async () => {
        const execution = [];

        const plugin = {
          id: "feature",

          dependencies: [
            "missing"
          ],

          async start() {
            execution.push("started");
          }
        };

        const runtime = new ItoastRuntime();

        runtime.registerPlugin(plugin);

        await assert.rejects(
          runtime.start(),
          /Missing plugin dependency/
        );

        assert.deepEqual(
          execution,
          []
        );

        assert.equal(
          runtime.getState(),
          RUNTIME_STATES.FAILED
        );
      }
    );

    test(
      "circular dependency prevents runtime startup",
      async () => {
        const execution = [];

        const first = {
          id: "first",

          dependencies: [
            "second"
          ],

          async start() {
            execution.push("first");
          }
        };

        const second = {
          id: "second",

          dependencies: [
            "first"
          ],

          async start() {
            execution.push("second");
          }
        };

        const runtime = new ItoastRuntime();

        runtime.registerPlugin(first);
        runtime.registerPlugin(second);

        await assert.rejects(
          runtime.start(),
          /Circular plugin dependency detected/
        );

        assert.deepEqual(
          execution,
          []
        );

        assert.equal(
          runtime.getState(),
          RUNTIME_STATES.FAILED
        );
      }
    );

    test(
      "independent plugins preserve registration order",
      async () => {
        const execution = [];

        const first = {
          id: "first",

          async start() {
            execution.push("first");
          }
        };

        const second = {
          id: "second",

          async start() {
            execution.push("second");
          }
        };

        const third = {
          id: "third",

          async start() {
            execution.push("third");
          }
        };

        const runtime = new ItoastRuntime();

        runtime.registerPlugin(first);
        runtime.registerPlugin(second);
        runtime.registerPlugin(third);

        await runtime.start();

        assert.deepEqual(
          execution,
          [
            "first",
            "second",
            "third"
          ]
        );
      }
    );
  }
);