import {
  RUNTIME_PLUGIN_STATES
} from "./runtime-plugin-state.js";

import {
  validatePluginDefinition
} from "./runtime-plugin-definition.js";

import {
  RuntimePluginFailure
} from "./runtime-plugin-failure.js";

async function executePluginMethod(
  plugin,
  method,
  context,
  stateManager,
  startingState,
  completedState
) {
  validatePluginDefinition(plugin);

  if (
    stateManager &&
    !stateManager.has(plugin.id)
  ) {
    stateManager.register(plugin.id);
  }

  if (stateManager) {
    stateManager.transition(
      plugin.id,
      startingState
    );
  }

  try {
    if (typeof plugin[method] === "function") {
      await plugin[method](context);
    }

    if (stateManager) {
      stateManager.transition(
        plugin.id,
        completedState
      );
    }

    return plugin;
  } catch (error) {
    if (stateManager) {
      stateManager.fail(
        plugin.id,
        new RuntimePluginFailure(
          plugin.id,
          error,
          method
        )
      );
    }

    throw error;
  }
}

export async function installPlugin(
  plugin,
  context,
  stateManager
) {
  return executePluginMethod(
    plugin,
    "install",
    context,
    stateManager,
    RUNTIME_PLUGIN_STATES.INSTALLING,
    RUNTIME_PLUGIN_STATES.INSTALLED
  );
}

export async function initializePlugin(
  plugin,
  context,
  stateManager
) {
  return executePluginMethod(
    plugin,
    "initialize",
    context,
    stateManager,
    RUNTIME_PLUGIN_STATES.INITIALIZING,
    RUNTIME_PLUGIN_STATES.INITIALIZED
  );
}

export async function startPlugin(
  plugin,
  context,
  stateManager
) {
  return executePluginMethod(
    plugin,
    "start",
    context,
    stateManager,
    RUNTIME_PLUGIN_STATES.STARTING,
    RUNTIME_PLUGIN_STATES.STARTED
  );
}

export async function stopPlugin(
  plugin,
  context,
  stateManager
) {
  return executePluginMethod(
    plugin,
    "stop",
    context,
    stateManager,
    RUNTIME_PLUGIN_STATES.STOPPING,
    RUNTIME_PLUGIN_STATES.STOPPED
  );
}

export async function uninstallPlugin(
  plugin,
  context,
  stateManager
) {
  return executePluginMethod(
    plugin,
    "uninstall",
    context,
    stateManager,
    RUNTIME_PLUGIN_STATES.UNINSTALLING,
    RUNTIME_PLUGIN_STATES.UNINSTALLED
  );
}

export async function installPlugins(
  plugins,
  context,
  stateManager
) {
  for (const plugin of plugins) {
    await installPlugin(
      plugin,
      context,
      stateManager
    );
  }

  return plugins;
}

export async function initializePlugins(
  plugins,
  context,
  stateManager
) {
  for (const plugin of plugins) {
    await initializePlugin(
      plugin,
      context,
      stateManager
    );
  }

  return plugins;
}

export async function startPlugins(
  plugins,
  context,
  stateManager
) {
  for (const plugin of plugins) {
    await startPlugin(
      plugin,
      context,
      stateManager
    );
  }

  return plugins;
}

export async function stopPlugins(
  plugins,
  context,
  stateManager
) {
  for (const plugin of plugins) {
    await stopPlugin(
      plugin,
      context,
      stateManager
    );
  }

  return plugins;
}

export async function uninstallPlugins(
  plugins,
  context,
  stateManager
) {
  for (const plugin of plugins) {
    await uninstallPlugin(
      plugin,
      context,
      stateManager
    );
  }

  return plugins;
}