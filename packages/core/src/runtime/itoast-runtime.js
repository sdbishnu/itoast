import { RUNTIME_STATES } from "./runtime-state.js";
import { RuntimeContext } from "../context/runtime-context.js";
import { createRuntimeOptions } from "../configuration/runtime-options.js";

export class ItoastRuntime {
  constructor(options = {}) {
    this.options = createRuntimeOptions(options);
    this.context = new RuntimeContext();
    this.state = RUNTIME_STATES.CREATED;
  }

  start() {
    if (this.state === RUNTIME_STATES.RUNNING) {
      return;
    }

    this.state = RUNTIME_STATES.STARTING;
    this.state = RUNTIME_STATES.RUNNING;
  }

  stop() {
    if (this.state === RUNTIME_STATES.STOPPED) {
      return;
    }

    this.state = RUNTIME_STATES.STOPPING;
    this.state = RUNTIME_STATES.STOPPED;
  }

  isStarted() {
    return this.state === RUNTIME_STATES.RUNNING;
  }

  getState() {
    return this.state;
  }

  getContext() {
    return this.context;
  }

  getOptions() {
    return this.options;
  }
}
