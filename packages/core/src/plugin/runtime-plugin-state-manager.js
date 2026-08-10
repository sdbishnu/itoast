import {
  RUNTIME_PLUGIN_STATES
} from "./runtime-plugin-state.js";

const VALID_TRANSITIONS = Object.freeze({
  [RUNTIME_PLUGIN_STATES.REGISTERED]: [
    RUNTIME_PLUGIN_STATES.INSTALLING,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.INSTALLING]: [
    RUNTIME_PLUGIN_STATES.INSTALLED,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.INSTALLED]: [
    RUNTIME_PLUGIN_STATES.INITIALIZING,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.INITIALIZING]: [
    RUNTIME_PLUGIN_STATES.INITIALIZED,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.INITIALIZED]: [
    RUNTIME_PLUGIN_STATES.STARTING,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.STARTING]: [
    RUNTIME_PLUGIN_STATES.STARTED,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.STARTED]: [
    RUNTIME_PLUGIN_STATES.STOPPING,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.STOPPING]: [
    RUNTIME_PLUGIN_STATES.STOPPED,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.STOPPED]: [
    RUNTIME_PLUGIN_STATES.UNINSTALLING,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.UNINSTALLING]: [
    RUNTIME_PLUGIN_STATES.UNINSTALLED,
    RUNTIME_PLUGIN_STATES.FAILED
  ],

  [RUNTIME_PLUGIN_STATES.UNINSTALLED]: [],

  [RUNTIME_PLUGIN_STATES.FAILED]: [
    RUNTIME_PLUGIN_STATES.STOPPING,
    RUNTIME_PLUGIN_STATES.UNINSTALLING,
    RUNTIME_PLUGIN_STATES.UNINSTALLED
  ]
});

export class RuntimePluginStateManager {
  constructor() {
    this.states = new Map();
    this.failures = new Map();
  }

  register(pluginId) {
    this.states.set(
      pluginId,
      RUNTIME_PLUGIN_STATES.REGISTERED
    );

    this.failures.delete(pluginId);

    return this.get(pluginId);
  }

  has(pluginId) {
    return this.states.has(pluginId);
  }

  get(pluginId) {
    return this.states.get(pluginId);
  }

  transition(pluginId, nextState) {
    const currentState = this.states.get(pluginId);

    if (!currentState) {
      throw new Error(
        `Plugin is not registered: ${pluginId}`
      );
    }

    const validStates =
      VALID_TRANSITIONS[currentState] ?? [];

    if (!validStates.includes(nextState)) {
      throw new Error(
        `Invalid plugin state transition: ${currentState} -> ${nextState}`
      );
    }

    this.states.set(
      pluginId,
      nextState
    );

    if (
      nextState !==
      RUNTIME_PLUGIN_STATES.FAILED
    ) {
      this.failures.delete(pluginId);
    }

    return nextState;
  }

  fail(pluginId, failure = undefined) {
    const currentState =
      this.states.get(pluginId);

    if (!currentState) {
      throw new Error(
        `Plugin is not registered: ${pluginId}`
      );
    }

    this.states.set(
      pluginId,
      RUNTIME_PLUGIN_STATES.FAILED
    );

    if (failure) {
      this.failures.set(
        pluginId,
        failure
      );
    }

    return RUNTIME_PLUGIN_STATES.FAILED;
  }

  getFailure(pluginId) {
    return this.failures.get(pluginId);
  }

  hasFailure(pluginId) {
    return this.failures.has(pluginId);
  }

  getFailures() {
    return new Map(this.failures);
  }

  unregister(pluginId) {
    this.failures.delete(pluginId);
    return this.states.delete(pluginId);
  }

  getAll() {
    return new Map(this.states);
  }

  clear() {
    this.states.clear();
    this.failures.clear();
  }
}