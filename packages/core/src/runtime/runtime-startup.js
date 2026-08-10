export async function runStartupPipeline(startupContext, stages = []) {
  if (!startupContext || typeof startupContext !== "object") {
    throw new TypeError("Startup context is required.");
  }

  if (!Array.isArray(stages)) {
    throw new TypeError("Startup stages must be an array.");
  }

  for (const stage of stages) {
    if (typeof stage !== "function") {
      throw new TypeError("Startup stage must be a function.");
    }

    await stage(startupContext);
  }

  return startupContext;
}
