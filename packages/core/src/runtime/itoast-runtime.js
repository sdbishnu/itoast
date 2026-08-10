import { RUNTIME_STATES } from "./runtime-state.js";
import { transitionState } from "./runtime-lifecycle.js";
import { runStartupPipeline } from "./runtime-startup.js";
import { runShutdownPipeline } from "./runtime-shutdown.js";
import { RuntimeContext } from "../context/runtime-context.js";
import { createRuntimeOptions } from "../configuration/runtime-options.js";
import { RuntimeExtensions } from "./runtime-extensions.js";
import { RuntimePluginManager } from "../plugin/runtime-plugin-manager.js";
import { RuntimePluginRegistry } from "../plugin/runtime-plugin-registry.js";

export class ItoastRuntime {
  constructor(options = {}) {
    this.options = createRuntimeOptions(options);

    this.context = new RuntimeContext();

    this.extensions = new RuntimeExtensions();

    this.pluginManager = new RuntimePluginManager({
      registry: new RuntimePluginRegistry()
    });

    this.state = RUNTIME_STATES.CREATED;
  }

  async start() {
    if (this.state === RUNTIME_STATES.RUNNING) {
      return;
    }

    this.state = transitionState(
      this.state,
      RUNTIME_STATES.STARTING
    );

    const startupContext = {
      runtime: this,
      context: this.context,
      options: this.options
    };

    try {
      await this.pluginManager.install(
        startupContext
      );

      await this.pluginManager.initialize(
        startupContext
      );

      await runStartupPipeline(
        startupContext,
        [
          ...(this.options.startupStages ?? []),
          ...this.extensions.getStartupStages()
        ]
      );

      await this.pluginManager.start(
        startupContext
      );

      this.state = transitionState(
        this.state,
        RUNTIME_STATES.RUNNING
      );
    } catch (error) {
      this.state = transitionState(
        this.state,
        RUNTIME_STATES.FAILED
      );

      throw error;
    }
  }

  async stop() {
    if (this.state === RUNTIME_STATES.STOPPED) {
      return;
    }

    if (this.state === RUNTIME_STATES.CREATED) {
      this.state = transitionState(
        this.state,
        RUNTIME_STATES.STOPPED
      );

      return;
    }

    this.state = transitionState(
      this.state,
      RUNTIME_STATES.STOPPING
    );

    const shutdownContext = {
      runtime: this,
      context: this.context,
      options: this.options
    };

    try {
      await this.pluginManager.stop(
        shutdownContext
      );

      await runShutdownPipeline(
        shutdownContext,
        [
          ...(this.options.shutdownStages ?? []),
          ...this.extensions.getShutdownStages()
        ]
      );

      await this.pluginManager.uninstall(
        shutdownContext
      );

      this.state = transitionState(
        this.state,
        RUNTIME_STATES.STOPPED
      );
    } catch (error) {
      this.state = transitionState(
        this.state,
        RUNTIME_STATES.FAILED
      );

      throw error;
    }
  }

  registerPlugin(plugin) {
    return this.pluginManager.register(
      plugin
    );
  }

  unregisterPlugin(pluginId) {
    return this.pluginManager.unregister(
      pluginId
    );
  }

  async uninstallPlugin(pluginId) {
    return this.pluginManager.uninstallPlugin(
      pluginId,
      {
        runtime: this,
        context: this.context,
        options: this.options
      }
    );
  }

  hasPlugin(pluginId) {
    return this.pluginManager.has(
      pluginId
    );
  }

  getPlugin(pluginId) {
    return this.pluginManager.get(
      pluginId
    );
  }

  getPlugins() {
    return this.pluginManager.getAll();
  }

  enablePlugin(pluginId) {
    return this.pluginManager.enable(
      pluginId
    );
  }

  disablePlugin(pluginId) {
    return this.pluginManager.disable(
      pluginId
    );
  }

  isPluginEnabled(pluginId) {
    return this.pluginManager.isEnabled(
      pluginId
    );
  }

  isPluginDisabled(pluginId) {
    return this.pluginManager.isDisabled(
      pluginId
    );
  }

  getPluginStatus(pluginId) {
    return this.pluginManager.getStatus(
      pluginId
    );
  }

  getPluginStatuses() {
    return this.pluginManager.getStatuses();
  }

  getPluginRegistry() {
    return this.pluginManager.getRegistry();
  }

  getPluginDependencyResolver() {
    return this.pluginManager.getDependencyResolver();
  }

  getPluginStateManager() {
    return this.pluginManager.getStateManager();
  }

  getPluginStatusManager() {
    return this.pluginManager.getStatusManager();
  }

  getPluginState(pluginId) {
    return this.pluginManager.getState(
      pluginId
    );
  }

  getPluginStates() {
    return this.pluginManager.getStates();
  }

  getPluginManager() {
    return this.pluginManager;
  }

  getExtensions() {
    return this.extensions;
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