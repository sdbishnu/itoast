export function validatePluginDefinition(plugin) {
  if (!plugin || typeof plugin !== "object") {
    throw new TypeError("Plugin must be an object.");
  }

  if (
    typeof plugin.id !== "string" ||
    plugin.id.trim().length === 0
  ) {
    throw new TypeError(
      "Plugin id must be a non-empty string."
    );
  }

  if (
    plugin.name !== undefined &&
    typeof plugin.name !== "string"
  ) {
    throw new TypeError(
      "Plugin name must be a string."
    );
  }

  if (
    plugin.version !== undefined &&
    typeof plugin.version !== "string"
  ) {
    throw new TypeError(
      "Plugin version must be a string."
    );
  }

  if (
    plugin.description !== undefined &&
    typeof plugin.description !== "string"
  ) {
    throw new TypeError(
      "Plugin description must be a string."
    );
  }

  if (plugin.dependencies !== undefined) {
    if (!Array.isArray(plugin.dependencies)) {
      throw new TypeError(
        "Plugin dependencies must be an array."
      );
    }

    const dependencyIds = new Set();

    for (const dependency of plugin.dependencies) {
      if (
        typeof dependency !== "string" ||
        dependency.trim().length === 0
      ) {
        throw new TypeError(
          "Plugin dependency must be a non-empty string."
        );
      }

      if (dependency === plugin.id) {
        throw new TypeError(
          `Plugin cannot depend on itself: ${plugin.id}`
        );
      }

      if (dependencyIds.has(dependency)) {
        throw new TypeError(
          `Duplicate plugin dependency: ${dependency}`
        );
      }

      dependencyIds.add(dependency);
    }
  }

  const lifecycleMethods = [
    "install",
    "initialize",
    "start",
    "stop",
    "uninstall"
  ];

  for (const method of lifecycleMethods) {
    if (
      plugin[method] !== undefined &&
      typeof plugin[method] !== "function"
    ) {
      throw new TypeError(
        `Plugin ${method} must be a function.`
      );
    }
  }

  return true;
}

export function createPluginDefinition(plugin) {
  validatePluginDefinition(plugin);

  return Object.freeze({
    id: plugin.id,
    name: plugin.name ?? plugin.id,
    version: plugin.version ?? "0.1.0",
    description: plugin.description ?? "",
    dependencies: Object.freeze([
      ...(plugin.dependencies ?? [])
    ])
  });
}