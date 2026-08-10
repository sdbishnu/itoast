import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { runStartupPipeline } from "../src/runtime/runtime-startup.js";

describe("Startup Pipeline", () => {
  test("startup pipeline accepts a runtime startup context", async () => {
    const startupContext = {
      runtime: {},
      context: {},
      options: {}
    };

    const result = await runStartupPipeline(startupContext);

    assert.equal(result, startupContext);
  });

  test("startup pipeline passes the same context to stages", async () => {
    const startupContext = {
      runtime: {},
      context: {},
      options: {}
    };

    let receivedContext;

    await runStartupPipeline(
      startupContext,
      [
        async context => {
          receivedContext = context;
        }
      ]
    );

    assert.equal(receivedContext, startupContext);
  });

  test("startup pipeline preserves context when a stage returns another value", async () => {
    const startupContext = {
      runtime: {},
      context: {},
      options: {}
    };

    const replacementContext = {
      runtime: {},
      context: {},
      options: {
        replacement: true
      }
    };

    const result = await runStartupPipeline(
      startupContext,
      [
        async () => replacementContext
      ]
    );

    assert.equal(result, startupContext);
    assert.notEqual(result, replacementContext);
  });

  test("startup pipeline executes stages in order", async () => {
    const startupContext = { order: [] };

    await runStartupPipeline(
      startupContext,
      [
        async context => context.order.push("first"),
        async context => context.order.push("second"),
        async context => context.order.push("third")
      ]
    );

    assert.deepEqual(startupContext.order, [
      "first",
      "second",
      "third"
    ]);
  });

  test("startup pipeline rejects a missing context", async () => {
    await assert.rejects(
      () => runStartupPipeline(null),
      TypeError
    );
  });

  test("startup pipeline rejects invalid stages", async () => {
    await assert.rejects(
      () => runStartupPipeline({}, ["invalid"]),
      TypeError
    );
  });
});
