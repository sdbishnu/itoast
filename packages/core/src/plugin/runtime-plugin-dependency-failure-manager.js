import {
  RuntimePluginDependencyFailure
} from "./runtime-plugin-dependency-failure.js";

export class RuntimePluginDependencyFailureManager {
  constructor() {
    this.failures = new Map();
  }

  record(
    pluginId,
    dependencyId,
    dependencyFailure
  ) {
    const failure =
      new RuntimePluginDependencyFailure(
        pluginId,
        dependencyId,
        dependencyFailure
      );

    this.failures.set(
      pluginId,
      failure
    );

    return failure;
  }

  has(pluginId) {
    return this.failures.has(pluginId);
  }

  get(pluginId) {
    return this.failures.get(pluginId);
  }

  getAll() {
    return new Map(this.failures);
  }

  clear(pluginId) {
    if (pluginId === undefined) {
      this.failures.clear();
      return;
    }

    this.failures.delete(pluginId);
  }

  clearAll() {
    this.failures.clear();
  }
}