import test from "node:test";
import assert from "node:assert/strict";
import { RuntimeContext } from "../src/index.js";

test("runtime context stores and retrieves values", () => {
  const context = new RuntimeContext();

  context.set("app.name", "ITOAST");

  assert.equal(context.get("app.name"), "ITOAST");
});

test("runtime context returns default values", () => {
  const context = new RuntimeContext();

  assert.equal(context.get("missing", "default"), "default");
});

test("runtime context checks value existence", () => {
  const context = new RuntimeContext();

  context.set("feature.enabled", true);

  assert.equal(context.has("feature.enabled"), true);
  assert.equal(context.has("feature.missing"), false);
});

test("runtime context deletes values", () => {
  const context = new RuntimeContext();

  context.set("temporary", "value");

  assert.equal(context.delete("temporary"), true);
  assert.equal(context.has("temporary"), false);
});

test("runtime context clears values", () => {
  const context = new RuntimeContext();

  context.set("one", 1);
  context.set("two", 2);
  context.clear();

  assert.deepEqual(context.entries(), []);
});