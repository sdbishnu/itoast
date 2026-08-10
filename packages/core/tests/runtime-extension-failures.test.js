import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  ItoastRuntime,
  RUNTIME_STATES
} from "../src/index.js";

describe("Runtime Extension Failures", () => {
  test("startup extension failure transitions runtime to FAILED", async () => {
    const startupError = new Error(
      "Startup extension failed"
    );

    const runtime = new ItoastRuntime();

    runtime
      .getExtensions()
      .addStartupStage(async () => {
        throw startupError;
      });

    await assert.rejects(
      runtime.start(),
      (error) => error === startupError
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.FAILED
    );

    assert.equal(
      runtime.isStarted(),
      false
    );
  });

  test("startup extension failure preserves original error", async () => {
    const startupError = new Error(
      "Original startup extension error"
    );

    const runtime = new ItoastRuntime();

    runtime
      .getExtensions()
      .addStartupStage(async () => {
        throw startupError;
      });

    await assert.rejects(
      runtime.start(),
      (error) => {
        assert.equal(error, startupError);
        assert.equal(
          error.message,
          "Original startup extension error"
        );

        return true;
      }
    );
  });

  test("failed startup extension stops later extensions", async () => {
    const execution = [];

    const startupError = new Error(
      "Startup extension failed"
    );

    const runtime = new ItoastRuntime();

    runtime
      .getExtensions()
      .addStartupStage(async () => {
        execution.push("first");
        throw startupError;
      });

    runtime
      .getExtensions()
      .addStartupStage(async () => {
        execution.push("second");
      });

    await assert.rejects(
      runtime.start(),
      (error) => error === startupError
    );

    assert.deepEqual(
      execution,
      ["first"]
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.FAILED
    );
  });

  test("shutdown extension failure transitions runtime to FAILED", async () => {
    const shutdownError = new Error(
      "Shutdown extension failed"
    );

    const runtime = new ItoastRuntime();

    runtime
      .getExtensions()
      .addShutdownStage(async () => {
        throw shutdownError;
      });

    await runtime.start();

    await assert.rejects(
      runtime.stop(),
      (error) => error === shutdownError
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.FAILED
    );

    assert.equal(
      runtime.isStarted(),
      false
    );
  });

  test("failed shutdown extension stops later extensions", async () => {
    const execution = [];

    const shutdownError = new Error(
      "Shutdown extension failed"
    );

    const runtime = new ItoastRuntime();

    runtime
      .getExtensions()
      .addShutdownStage(async () => {
        execution.push("first");
        throw shutdownError;
      });

    runtime
      .getExtensions()
      .addShutdownStage(async () => {
        execution.push("second");
      });

    await runtime.start();

    await assert.rejects(
      runtime.stop(),
      (error) => error === shutdownError
    );

    assert.deepEqual(
      execution,
      ["first"]
    );

    assert.equal(
      runtime.getState(),
      RUNTIME_STATES.FAILED
    );
  });
});