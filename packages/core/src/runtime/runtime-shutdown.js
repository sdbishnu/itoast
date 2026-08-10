export async function runShutdownPipeline(shutdownContext, stages = []) {
  if (!shutdownContext || typeof shutdownContext !== "object") {
    throw new TypeError("Shutdown context is required.");
  }

  if (!Array.isArray(stages)) {
    throw new TypeError("Shutdown stages must be an array.");
  }

  for (const stage of stages) {
    if (typeof stage !== "function") {
      throw new TypeError("Shutdown stage must be a function.");
    }

    await stage(shutdownContext);
  }

  return shutdownContext;
}
