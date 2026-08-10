import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { RuntimeError } from "../src/index.js";

describe("Runtime Error", () => {
  test("RuntimeError extends Error", () => {
    const error = new RuntimeError("Runtime failed");

    assert.equal(error instanceof Error, true);
    assert.equal(error instanceof RuntimeError, true);
  });

  test("RuntimeError has the correct name", () => {
    const error = new RuntimeError("Runtime failed");

    assert.equal(error.name, "RuntimeError");
  });

  test("RuntimeError supports an error code", () => {
    const error = new RuntimeError(
      "Runtime failed",
      "RUNTIME_START_FAILED"
    );

    assert.equal(error.code, "RUNTIME_START_FAILED");
  });

  test("RuntimeError supports details", () => {
    const details = { state: "starting", reason: "test" };
    const error = new RuntimeError(
      "Runtime failed",
      "RUNTIME_START_FAILED",
      details
    );

    assert.deepEqual(error.details, details);
  });

  test("RuntimeError preserves the message", () => {
    const error = new RuntimeError("Runtime initialization failed");

    assert.equal(error.message, "Runtime initialization failed");
  });
});
