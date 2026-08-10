import {
  validatePluginDefinition
} from "./runtime-plugin-definition.js";

export class RuntimePluginRegistry {
  constructor() {
    this.plugins = new Map();
  }

  register(plugin) {
    validatePluginDefinition(plugin);

    if (this.plugins.has(plugin.id)) {
      throw new Error(
        `Plugin already registered: ${plugin.id}`
      );
    }

    this.plugins.set(plugin.id, plugin);

    return plugin;
  }

  unregister(pluginId) {
    return this.plugins.delete(pluginId);
  }

  has(pluginId) {
    return this.plugins.has(pluginId);
  }

  get(pluginId) {
    return this.plugins.get(pluginId);
  }

  getAll() {
    return [...this.plugins.values()];
  }

  clear() {
    this.plugins.clear();
  }
}