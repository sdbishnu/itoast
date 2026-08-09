import test from "node:test";
import assert from "node:assert/strict";
import { ItoastRuntime, RUNTIME_STATES } from "../src/index.js";

test("runtime starts in CREATED state", () => {
  const runtime = new ItoastRuntime();
  assert.equal(runtime.getState(), RUNTIME_STATES.CREATED);
  assert.equal(runtime.isStarted(), false);
});

test("runtime transitions to RUNNING when started", () => {
  const runtime = new ItoastRuntime();
  runtime.start();
  assert.equal(runtime.getState(), RUNTIME_STATES.RUNNING);
  assert.equal(runtime.isStarted(), true);
});

test("runtime start is idempotent", () => {
  const runtime = new ItoastRuntime();
  runtime.start();
  runtime.start();
  assert.equal(runtime.getState(), RUNTIME_STATES.RUNNING);
});

test("runtime transitions to STOPPED when stopped", () => {
  const runtime = new ItoastRuntime();
  runtime.start();
  runtime.stop();
  assert.equal(runtime.getState(), RUNTIME_STATES.STOPPED);
  assert.equal(runtime.isStarted(), false);
});

test("runtime stop is idempotent", () => {
  const runtime = new ItoastRuntime();
  runtime.stop();
  runtime.stop();
  assert.equal(runtime.getState(), RUNTIME_STATES.STOPPED);
});

test("runtime options use defaults", () => {
  const runtime = new ItoastRuntime();
  assert.deepEqual(runtime.getOptions(), {});
});

test("runtime options are copied from input", () => {
  const options = { mode: "development", debug: true };
  const runtime = new ItoastRuntime(options);
  assert.deepEqual(runtime.getOptions(), options);
  assert.notEqual(runtime.getOptions(), options);
});

test("runtime options are deeply immutable", () => {
  const runtime = new ItoastRuntime({
    mode: "development",
    theme: { mode: "dark" }
  });

  assert.equal(Object.isFrozen(runtime.getOptions()), true);
  assert.equal(Object.isFrozen(runtime.getOptions().theme), true);
});

test("runtime rejects invalid options", () => {
  assert.throws(() => new ItoastRuntime([]), TypeError);
  assert.throws(() => new ItoastRuntime(null), TypeError);
});
