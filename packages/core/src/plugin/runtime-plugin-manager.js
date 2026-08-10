import {
  RuntimePluginDependencyResolver
} from "./runtime-plugin-dependency-resolver.js";

import {
  RuntimePluginStateManager
} from "./runtime-plugin-state-manager.js";

import {
  RuntimePluginStatusManager
} from "./runtime-plugin-status-manager.js";

import {
  RuntimePluginDependencyFailureManager
} from "./runtime-plugin-dependency-failure-manager.js";

import {
  installPlugin,
  initializePlugin,
  startPlugin,
  stopPlugin,
  uninstallPlugin
} from "./runtime-plugin-lifecycle.js";

export class RuntimePluginManager {
  constructor(options = {}) {
    if (!options.registry) {
      throw new TypeError(
        "Plugin registry is required."
      );
    }

    this.registry = options.registry;

    this.dependencyResolver =
      options.dependencyResolver ??
      new RuntimePluginDependencyResolver();

    this.stateManager =
      options.stateManager ??
      new RuntimePluginStateManager();

    this.statusManager =
      options.statusManager ??
      new RuntimePluginStatusManager();

    this.dependencyFailureManager =
      options.dependencyFailureManager ??
      new RuntimePluginDependencyFailureManager();
  }

  register(plugin) {
    const result =
      this.registry.register(plugin);

    this.stateManager.register(
      plugin.id
    );

    this.statusManager.register(
      plugin.id
    );

    this.dependencyFailureManager.clear(
      plugin.id
    );

    return result;
  }

  unregister(pluginId) {
    const result =
      this.registry.unregister(
        pluginId
      );

    this.stateManager.unregister(
      pluginId
    );

    this.statusManager.unregister(
      pluginId
    );

    this.dependencyFailureManager.clear(
      pluginId
    );

    return result;
  }

  has(pluginId) {
    return this.registry.has(
      pluginId
    );
  }

  get(pluginId) {
    return this.registry.get(
      pluginId
    );
  }

  getAll() {
    return this.registry.getAll();
  }

  getEnabledPlugins() {
    return this.getAll().filter(
      plugin =>
        this.statusManager.isEnabled(
          plugin.id
        )
    );
  }

  getDisabledPlugins() {
    return this.getAll().filter(
      plugin =>
        this.statusManager.isDisabled(
          plugin.id
        )
    );
  }

  enable(pluginId) {
    this.ensurePluginExists(
      pluginId
    );

    this.dependencyFailureManager.clear(
      pluginId
    );

    return this.statusManager.enable(
      pluginId
    );
  }

  disable(pluginId) {
    this.ensurePluginExists(
      pluginId
    );

    return this.statusManager.disable(
      pluginId
    );
  }

  isEnabled(pluginId) {
    return this.statusManager.isEnabled(
      pluginId
    );
  }

  isDisabled(pluginId) {
    return this.statusManager.isDisabled(
      pluginId
    );
  }

  getStatus(pluginId) {
    return this.statusManager.get(
      pluginId
    );
  }

  getStatuses() {
    return this.statusManager.getAll();
  }

  resolve() {
    return this.dependencyResolver.resolve(
      this.registry.getAll()
    );
  }

  resolveEnabled() {
    return this.resolve().filter(
      plugin =>
        this.statusManager.isEnabled(
          plugin.id
        )
    );
  }

  getState(pluginId) {
    return this.stateManager.get(
      pluginId
    );
  }

  getStates() {
    return this.stateManager.getAll();
  }

  getRegistry() {
    return this.registry;
  }

  getDependencyResolver() {
    return this.dependencyResolver;
  }

  getStateManager() {
    return this.stateManager;
  }

  getStatusManager() {
    return this.statusManager;
  }

  getDependencyFailureManager() {
    return this.dependencyFailureManager;
  }

  getDependencyFailure(pluginId) {
    return this.dependencyFailureManager.get(
      pluginId
    );
  }

  getDependencyFailures() {
    return this.dependencyFailureManager.getAll();
  }

  hasDependencyFailure(pluginId) {
    return this.dependencyFailureManager.has(
      pluginId
    );
  }

  getFailedDependencies(plugin) {
    const dependencies =
      Array.isArray(plugin.dependencies)
        ? plugin.dependencies
        : [];

    return dependencies
      .map(dependencyId => ({
        dependencyId,
        failure:
          this.stateManager.getFailure(
            dependencyId
          )
      }))
      .filter(
        item => item.failure
      );
  }

  ensureDependenciesHealthy(plugin) {
    const failedDependencies =
      this.getFailedDependencies(
        plugin
      );

    if (
      failedDependencies.length === 0
    ) {
      return;
    }

    const dependency =
      failedDependencies[0];

    this.dependencyFailureManager.record(
      plugin.id,
      dependency.dependencyId,
      dependency.failure
    );

    throw new Error(
      `Plugin dependency failed: ${plugin.id} depends on ${dependency.dependencyId}`
    );
  }

  getExecutablePlugins() {
    const executablePlugins = [];

    for (
      const plugin of this.resolveEnabled()
    ) {
      try {
        this.ensureDependenciesHealthy(
          plugin
        );

        executablePlugins.push(
          plugin
        );
      } catch {
        // Dependency failure is recorded.
        // The dependent plugin is skipped.
      }
    }

    return executablePlugins;
  }

  async install(context) {
    const plugins =
      this.resolveEnabled();

    const executedPlugins = [];

    let firstError = null;

    for (const plugin of plugins) {
      try {
        this.ensureDependenciesHealthy(
          plugin
        );

        await installPlugin(
          plugin,
          context,
          this.stateManager
        );

        executedPlugins.push(
          plugin
        );
      } catch (error) {
        if (!firstError) {
          firstError = error;
        }
      }
    }

    if (firstError) {
      throw firstError;
    }

    return executedPlugins;
  }

  async initialize(context) {
    const plugins =
      this.resolveEnabled();

    const executedPlugins = [];

    let firstError = null;

    for (const plugin of plugins) {
      try {
        this.ensureDependenciesHealthy(
          plugin
        );

        await initializePlugin(
          plugin,
          context,
          this.stateManager
        );

        executedPlugins.push(
          plugin
        );
      } catch (error) {
        if (!firstError) {
          firstError = error;
        }
      }
    }

    if (firstError) {
      throw firstError;
    }

    return executedPlugins;
  }

  async start(context) {
    const plugins =
      this.resolveEnabled();

    const executedPlugins = [];

    let firstError = null;

    for (const plugin of plugins) {
      try {
        this.ensureDependenciesHealthy(
          plugin
        );

        await startPlugin(
          plugin,
          context,
          this.stateManager
        );

        executedPlugins.push(
          plugin
        );
      } catch (error) {
        if (!firstError) {
          firstError = error;
        }
      }
    }

    if (firstError) {
      throw firstError;
    }

    return executedPlugins;
  }

  async stop(context) {
    const plugins =
      this.resolveEnabled().reverse();

    for (const plugin of plugins) {
      await stopPlugin(
        plugin,
        context,
        this.stateManager
      );
    }

    return plugins;
  }

  async uninstall(context) {
    const plugins =
      this.resolveEnabled().reverse();

    for (const plugin of plugins) {
      await uninstallPlugin(
        plugin,
        context,
        this.stateManager
      );
    }

    return plugins;
  }

  async uninstallPlugin(
    pluginId,
    context
  ) {
    this.ensurePluginExists(
      pluginId
    );

    const plugin =
      this.get(pluginId);

    const currentState =
      this.getState(pluginId);

    if (
      currentState === "uninstalled"
    ) {
      return plugin;
    }

    if (
      currentState === "started"
    ) {
      await stopPlugin(
        plugin,
        context,
        this.stateManager
      );
    }

    if (
      this.getState(pluginId) ===
      "stopped"
    ) {
      await uninstallPlugin(
        plugin,
        context,
        this.stateManager
      );
    }

    return plugin;
  }

  ensurePluginExists(pluginId) {
    if (
      !this.registry.has(
        pluginId
      )
    ) {
      throw new Error(
        `Plugin is not registered: ${pluginId}`
      );
    }
  }
}