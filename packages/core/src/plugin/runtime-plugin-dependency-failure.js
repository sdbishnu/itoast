export class RuntimePluginDependencyFailure {
  constructor(pluginId, dependencyId, dependencyFailure) {
    this.pluginId = pluginId;
    this.dependencyId = dependencyId;
    this.dependencyFailure = dependencyFailure;

    Object.freeze(this);
  }

  getPluginId() {
    return this.pluginId;
  }

  getDependencyId() {
    return this.dependencyId;
  }

  getDependencyFailure() {
    return this.dependencyFailure;
  }
}