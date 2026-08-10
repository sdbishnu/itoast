import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { RuntimeExtensions } from "../src/runtime/runtime-extensions.js";

describe("Runtime Extensions", () => {
  test("creates empty extension collections", () => {
    const extensions = new RuntimeExtensions();

    assert.deepEqual(
      extensions.getStartupStages(),
      []
    );

    assert.deepEqual(
      extensions.getShutdownStages(),
      []
    );
  });

  test("registers a startup stage", () => {
    const extensions = new RuntimeExtensions();
    const stage = async () => {};

    const result =
      extensions.addStartupStage(stage);

    assert.equal(result, stage);

    assert.deepEqual(
      extensions.getStartupStages(),
      [stage]
    );
  });

  test("registers a shutdown stage", () => {
    const extensions = new RuntimeExtensions();
    const stage = async () => {};

    const result =
      extensions.addShutdownStage(stage);

    assert.equal(result, stage);

    assert.deepEqual(
      extensions.getShutdownStages(),
      [stage]
    );
  });

  test("preserves startup registration order", () => {
    const extensions = new RuntimeExtensions();

    const first = async () => {};
    const second = async () => {};
    const third = async () => {};

    extensions.addStartupStage(first);
    extensions.addStartupStage(second);
    extensions.addStartupStage(third);

    assert.deepEqual(
      extensions.getStartupStages(),
      [first, second, third]
    );
  });

  test("preserves shutdown registration order", () => {
    const extensions = new RuntimeExtensions();

    const first = async () => {};
    const second = async () => {};
    const third = async () => {};

    extensions.addShutdownStage(first);
    extensions.addShutdownStage(second);
    extensions.addShutdownStage(third);

    assert.deepEqual(
      extensions.getShutdownStages(),
      [first, second, third]
    );
  });

  test("rejects invalid startup extension", () => {
    const extensions = new RuntimeExtensions();

    assert.throws(
      () => extensions.addStartupStage("invalid"),
      TypeError
    );
  });

  test("rejects invalid shutdown extension", () => {
    const extensions = new RuntimeExtensions();

    assert.throws(
      () => extensions.addShutdownStage("invalid"),
      TypeError
    );
  });

  test("returns independent startup stage arrays", () => {
    const extensions = new RuntimeExtensions();
    const stage = async () => {};

    extensions.addStartupStage(stage);

    const stages =
      extensions.getStartupStages();

    stages.push(async () => {});

    assert.equal(
      extensions.getStartupStages().length,
      1
    );
  });

  test("returns independent shutdown stage arrays", () => {
    const extensions = new RuntimeExtensions();
    const stage = async () => {};

    extensions.addShutdownStage(stage);

    const stages =
      extensions.getShutdownStages();

    stages.push(async () => {});

    assert.equal(
      extensions.getShutdownStages().length,
      1
    );
  });

  test("removes a registered startup stage", () => {
    const extensions = new RuntimeExtensions();

    const first = async () => {};
    const second = async () => {};

    extensions.addStartupStage(first);
    extensions.addStartupStage(second);

    assert.equal(
      extensions.removeStartupStage(first),
      true
    );

    assert.deepEqual(
      extensions.getStartupStages(),
      [second]
    );
  });

  test("removes a registered shutdown stage", () => {
    const extensions = new RuntimeExtensions();

    const first = async () => {};
    const second = async () => {};

    extensions.addShutdownStage(first);
    extensions.addShutdownStage(second);

    assert.equal(
      extensions.removeShutdownStage(first),
      true
    );

    assert.deepEqual(
      extensions.getShutdownStages(),
      [second]
    );
  });

  test("returns false when removing unknown startup stage", () => {
    const extensions = new RuntimeExtensions();

    const stage = async () => {};

    assert.equal(
      extensions.removeStartupStage(stage),
      false
    );
  });

  test("returns false when removing unknown shutdown stage", () => {
    const extensions = new RuntimeExtensions();

    const stage = async () => {};

    assert.equal(
      extensions.removeShutdownStage(stage),
      false
    );
  });

  test("clears all startup stages", () => {
    const extensions = new RuntimeExtensions();

    extensions.addStartupStage(async () => {});
    extensions.addStartupStage(async () => {});

    extensions.clearStartupStages();

    assert.deepEqual(
      extensions.getStartupStages(),
      []
    );
  });

  test("clears all shutdown stages", () => {
    const extensions = new RuntimeExtensions();

    extensions.addShutdownStage(async () => {});
    extensions.addShutdownStage(async () => {});

    extensions.clearShutdownStages();

    assert.deepEqual(
      extensions.getShutdownStages(),
      []
    );
  });
});