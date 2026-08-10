import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { runShutdownPipeline } from "../src/index.js";

describe("Shutdown Pipeline", () => {
  test("shutdown pipeline accepts a shutdown context", async () => {
    const shutdownContext = {
      runtime: {},
      context: {},
      options: {}
    };

    const result = await runShutdownPipeline(shutdownContext);

    assert.equal(result, shutdownContext);
  });

  test("shutdown pipeline rejects a missing context", async () => {
    await assert.rejects(
      () => runShutdownPipeline(null),
      TypeError
    );
  });

  test("shutdown pipeline executes stages in declared order", async () => {
    const shutdownContext = { order: [] };

    await runShutdownPipeline(
      shutdownContext,
      [
        async context => context.order.push("first"),
        async context => context.order.push("second"),
        async context => context.order.push("third")
      ]
    );

    assert.deepEqual(shutdownContext.order, [
      "first",
      "second",
      "third"
    ]);
  });

  test("shutdown pipeline passes the same context to every stage", async () => {
    const shutdownContext = {
      runtime: {},
      context: {},
      options: {}
    };

    const receivedContexts = [];

    await runShutdownPipeline(
      shutdownContext,
      [
        async context => receivedContexts.push(context),
        async context => receivedContexts.push(context),
        async context => receivedContexts.push(context)
      ]
    );

    assert.equal(receivedContexts.length, 3);
    assert.equal(receivedContexts[0], shutdownContext);
    assert.equal(receivedContexts[1], shutdownContext);
    assert.equal(receivedContexts[2], shutdownContext);
  });

  test("shutdown pipeline waits for asynchronous stages", async () => {
    const shutdownContext = { order: [] };

    await runShutdownPipeline(
      shutdownContext,
      [
        async context => {
          await new Promise(resolve => setTimeout(resolve, 10));
          context.order.push("first");
        },
        async context => {
          context.order.push("second");
        }
      ]
    );

    assert.deepEqual(shutdownContext.order, ["first", "second"]);
  });

  test("shutdown pipeline rejects invalid stages", async () => {
    await assert.rejects(
      () => runShutdownPipeline({}, ["invalid"]),
      TypeError
    );
  });

  test("shutdown pipeline preserves the original context", async () => {
    const shutdownContext = {
      runtime: {},
      context: {},
      options: {}
    };

    const replacementContext = {
      replacement: true
    };

    const result = await runShutdownPipeline(
      shutdownContext,
      [
        async () => replacementContext
      ]
    );

    assert.equal(result, shutdownContext);
    assert.notEqual(result, replacementContext);
  });

  test("shutdown pipeline propagates stage errors", async () => {
    const shutdownError = new Error("Shutdown stage failed");
    const shutdownContext = {
      runtime: {},
      context: {},
      options: {}
    };

    await assert.rejects(
      runShutdownPipeline(
        shutdownContext,
        [
          async () => {
            throw shutdownError;
          }
        ]
      ),
      (error) => error === shutdownError
    );
  });

  test("shutdown pipeline stops executing after a failed stage", async () => {
    const execution = [];
    const shutdownError = new Error("Shutdown stage failed");
    const shutdownContext = { execution };

    await assert.rejects(
      runShutdownPipeline(
        shutdownContext,
        [
          async context => {
            context.execution.push("first");
            throw shutdownError;
          },
          async context => {
            context.execution.push("second");
          }
        ]
      ),
      (error) => error === shutdownError
    );

    assert.deepEqual(execution, ["first"]);
  });
});
