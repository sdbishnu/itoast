test("runtime transitions to STOPPED when stopped", async () => {
  const runtime = new ItoastRuntime();

  await runtime.start();
  await runtime.stop();

  assert.equal(runtime.getState(), RUNTIME_STATES.STOPPED);
  assert.equal(runtime.isStarted(), false);
});
