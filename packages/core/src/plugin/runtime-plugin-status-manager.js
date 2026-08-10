import {
  RUNTIME_PLUGIN_STATUS
} from "./runtime-plugin-status.js";

export class RuntimePluginStatusManager {
  constructor() {
    this.statuses = new Map();
  }

  register(pluginId) {
    if (!pluginId) {
      throw new TypeError(
        "Plugin ID is required."
      );
    }

    this.statuses.set(
      pluginId,
      RUNTIME_PLUGIN_STATUS.ENABLED
    );

    return this.get(pluginId);
  }

  enable(pluginId) {
    this.ensureRegistered(pluginId);

    this.statuses.set(
      pluginId,
      RUNTIME_PLUGIN_STATUS.ENABLED
    );

    return this.get(pluginId);
  }

  disable(pluginId) {
    this.ensureRegistered(pluginId);

    this.statuses.set(
      pluginId,
      RUNTIME_PLUGIN_STATUS.DISABLED
    );

    return this.get(pluginId);
  }

  isEnabled(pluginId) {
    return (
      this.get(pluginId) ===
      RUNTIME_PLUGIN_STATUS.ENABLED
    );
  }

  isDisabled(pluginId) {
    return (
      this.get(pluginId) ===
      RUNTIME_PLUGIN_STATUS.DISABLED
    );
  }

  get(pluginId) {
    return this.statuses.get(pluginId);
  }

  has(pluginId) {
    return this.statuses.has(pluginId);
  }

  unregister(pluginId) {
    return this.statuses.delete(pluginId);
  }

  getAll() {
    return new Map(this.statuses);
  }

  clear() {
    this.statuses.clear();
  }

  ensureRegistered(pluginId) {
    if (!this.statuses.has(pluginId)) {
      throw new Error(
        `Plugin is not registered: ${pluginId}`
      );
    }
  }
}