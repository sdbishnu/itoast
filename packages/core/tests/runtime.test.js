import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ItoastRuntime, RUNTIME_STATES } from "../src/index.js";

describe("Runtime Integration", () => {
  test("runtime starts in CREATED state", () => {
    const runtime = new ItoastRuntime();

    assert.equal(runtime.getState(), RUNTIME_STATES.CREATED);
    assert.equal(runtime.isStarted(), false);
  });

  test("runtime transitions to RUNNING when started", async () => {
    const runtime = new ItoastRuntime();

    await runtime.start();

    assert.equal(runtime.getState(), RUNTIME_STATES.RUNNING);
    assert.equal(runtime.isStarted(), true);
  });

  test("runtime start is idempotent", async () => {
    const runtime = new ItoastRuntime();

    await runtime.start();
    await runtime.start();

    assert.equal(runtime.getState(), RUNTIME_STATES.RUNNING);
  });

  test("runtime transitions to STOPPED when stopped", async () => {
    const runtime = new ItoastRuntime();

    await runtime.start();
    await runtime.stop();

    assert.equal(runtime.getState(), RUNTIME_STATES.STOPPED);
    assert.equal(runtime.isStarted(), false);
  });

  test("runtime stop is idempotent", async () => {
    const runtime = new ItoastRuntime();

    await runtime.stop();
    await runtime.stop();

    assert.equal(runtime.getState(), RUNTIME_STATES.STOPPED);
  });

  test("runtime startup failure transitions to FAILED", async () => {
    const startupError = new Error("Startup failed");

    const runtime = new ItoastRuntime({
      startupStages: [
        async () => {
          throw startupError;
        }
      ]
    });

    await assert.rejects(
      runtime.start(),
      (error) => error === startupError
    );

    assert.equal(runtime.getState(), RUNTIME_STATES.FAILED);
    assert.equal(runtime.isStarted(), false);
  });

  test("runtime startup failure preserves error", async () => {
    const startupError = new Error("Startup failed");

    const runtime = new ItoastRuntime({
      startupStages: [
        async () => {
          throw startupError;
        }
      ]
    });

    await assert.rejects(runtime.start(), startupError);

    assert.equal(runtime.getState(), RUNTIME_STATES.FAILED);
  });

  test("runtime remains STARTING during startup pipeline", async () => {
    let runtime;
    let observedState;

    runtime = new ItoastRuntime({
      startupStages: [
        async () => {
          observedState = runtime.getState();
        }
      ]
    });

    await runtime.start();

    assert.equal(observedState, RUNTIME_STATES.STARTING);
    assert.equal(runtime.getState(), RUNTIME_STATES.RUNNING);
  });

  test("runtime becomes RUNNING only after all startup stages complete", async () => {
    const execution = [];

    const runtime = new ItoastRuntime({
      startupStages: [
        async () => {
          execution.push("stage-1");
        },
        async () => {
          execution.push("stage-2");
        },
        async () => {
          execution.push("stage-3");
        }
      ]
    });

    await runtime.start();

    assert.deepEqual(execution, [
      "stage-1",
      "stage-2",
      "stage-3"
    ]);

    assert.equal(runtime.getState(), RUNTIME_STATES.RUNNING);
  });

  test("runtime executes shutdown stages before STOPPED", async () => {
    const execution = [];

    const runtime = new ItoastRuntime({
      shutdownStages: [
        async () => {
          execution.push("stage-1");
        },
        async () => {
          execution.push("stage-2");
        }
      ]
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(execution, [
      "stage-1",
      "stage-2"
    ]);

    assert.equal(runtime.getState(), RUNTIME_STATES.STOPPED);
  });

  test("runtime remains STOPPING during shutdown pipeline", async () => {
    let runtime;
    let observedState;

    runtime = new ItoastRuntime({
      shutdownStages: [
        async () => {
          observedState = runtime.getState();
        }
      ]
    });

    await runtime.start();
    await runtime.stop();

    assert.equal(observedState, RUNTIME_STATES.STOPPING);
    assert.equal(runtime.getState(), RUNTIME_STATES.STOPPED);
  });

  test("runtime shutdown failure transitions to FAILED", async () => {
    const shutdownError = new Error("Shutdown failed");

    const runtime = new ItoastRuntime({
      shutdownStages: [
        async () => {
          throw shutdownError;
        }
      ]
    });

    await runtime.start();

    await assert.rejects(
      runtime.stop(),
      (error) => error === shutdownError
    );

    assert.equal(runtime.getState(), RUNTIME_STATES.FAILED);
  });

  test("runtime options use defaults", () => {
    const runtime = new ItoastRuntime();

    assert.deepEqual(runtime.getOptions(), {});
  });

  test("runtime options are copied from input", () => {
    const options = {
      mode: "development",
      debug: true
    };

    const runtime = new ItoastRuntime(options);

    assert.deepEqual(runtime.getOptions(), options);
    assert.notEqual(runtime.getOptions(), options);
  });

  test("runtime options are deeply immutable", () => {
    const runtime = new ItoastRuntime({
      mode: "development",
      theme: {
        mode: "dark"
      }
    });

    assert.equal(
      Object.isFrozen(runtime.getOptions()),
      true
    );

    assert.equal(
      Object.isFrozen(runtime.getOptions().theme),
      true
    );
  });

  test("runtime rejects invalid options", () => {
    assert.throws(
      () => new ItoastRuntime([]),
      TypeError
    );

    assert.throws(
      () => new ItoastRuntime(null),
      TypeError
    );
  });

  test("runtime passes the correct shutdown context", async () => {
    const receivedContexts = [];

    const shutdownStage = async (shutdownContext) => {
      receivedContexts.push(shutdownContext);
    };

    const runtime = new ItoastRuntime({
      mode: "development",
      shutdownStages: [shutdownStage]
    });

    await runtime.start();
    await runtime.stop();

    assert.equal(receivedContexts.length, 1);
    assert.equal(receivedContexts[0].runtime, runtime);
    assert.equal(
      receivedContexts[0].context,
      runtime.getContext()
    );
    assert.equal(
      receivedContexts[0].options,
      runtime.getOptions()
    );
  });

  test("runtime stays STOPPING until the shutdown pipeline completes", async () => {
    let runtime;
    let observedBeforeResolve;
    let resolveShutdown;

    const shutdownPromise = new Promise((resolve) => {
      resolveShutdown = resolve;
    });

    runtime = new ItoastRuntime({
      shutdownStages: [
        async () => {
          observedBeforeResolve = runtime.getState();

          await shutdownPromise;
        }
      ]
    });

    await runtime.start();

    const stopPromise = runtime.stop();

    await new Promise((resolve) => {
      setImmediate(resolve);
    });

    assert.equal(
      observedBeforeResolve,
      RUNTIME_STATES.STOPPING
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.STOPPING
    );

    resolveShutdown();

    await stopPromise;

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.STOPPED
    );
  });

  test("runtime reaches STOPPED only after every shutdown stage completes", async () => {
    const execution = [];

    const runtime = new ItoastRuntime({
      shutdownStages: [
        async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 10);
          });

          execution.push("stage-1-complete");
        },

        async () => {
          execution.push("stage-2-complete");
        }
      ]
    });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(execution, [
      "stage-1-complete",
      "stage-2-complete"
    ]);

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.STOPPED
    );

    assert.equal(
      runtime.isStarted(),
      false
    );
  });

  test("runtime exposes runtime extensions", () => {
    const runtime = new ItoastRuntime();

    assert.ok(runtime.getExtensions());

    assert.equal(
      typeof runtime.getExtensions().addStartupStage,
      "function"
    );

    assert.equal(
      typeof runtime.getExtensions().addShutdownStage,
      "function"
    );
  });

  test("runtime executes registered startup extension", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime
      .getExtensions()
      .addStartupStage(async () => {
        execution.push("extension");
      });

    await runtime.start();

    assert.deepEqual(execution, [
      "extension"
    ]);

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.RUNNING
    );
  });

  test("runtime executes configured startup stages before registered extensions", async () => {
    const execution = [];

    const runtime = new ItoastRuntime({
      startupStages: [
        async () => {
          execution.push("configured");
        }
      ]
    });

    runtime
      .getExtensions()
      .addStartupStage(async () => {
        execution.push("extension");
      });

    await runtime.start();

    assert.deepEqual(execution, [
      "configured",
      "extension"
    ]);
  });

  test("runtime executes registered shutdown extension", async () => {
    const execution = [];

    const runtime = new ItoastRuntime();

    runtime
      .getExtensions()
      .addShutdownStage(async () => {
        execution.push("extension");
      });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(execution, [
      "extension"
    ]);

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.STOPPED
    );
  });

  test("runtime executes configured shutdown stages before registered extensions", async () => {
    const execution = [];

    const runtime = new ItoastRuntime({
      shutdownStages: [
        async () => {
          execution.push("configured");
        }
      ]
    });

    runtime
      .getExtensions()
      .addShutdownStage(async () => {
        execution.push("extension");
      });

    await runtime.start();
    await runtime.stop();

    assert.deepEqual(execution, [
      "configured",
      "extension"
    ]);
  });
});