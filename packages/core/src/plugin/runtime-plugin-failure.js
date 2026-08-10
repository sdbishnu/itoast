import {
  RUNTIME_PLUGIN_STATES
} from "./runtime-plugin-state.js";

export class RuntimePluginFailure {
  constructor(pluginId, error, phase) {
    this.pluginId = pluginId;
    this.error = error;
    this.phase = phase;
    this.state = RUNTIME_PLUGIN_STATES.FAILED;

    Object.freeze(this);
  }

  getPluginId() {
    return this.pluginId;
  }

  getError() {
    return this.error;
  }

  getPhase() {
    return this.phase;
  }

  getState() {
    return this.state;
  }
}