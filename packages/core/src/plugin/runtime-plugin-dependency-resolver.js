export class RuntimePluginDependencyResolver {
  resolve(plugins) {
    if (!Array.isArray(plugins)) {
      throw new TypeError(
        "Plugins must be an array."
      );
    }

    const pluginMap = new Map();

    for (const plugin of plugins) {
      if (
        !plugin ||
        typeof plugin !== "object" ||
        typeof plugin.id !== "string" ||
        plugin.id.trim().length === 0
      ) {
        throw new TypeError(
          "Plugin must have a valid id."
        );
      }

      if (pluginMap.has(plugin.id)) {
        throw new Error(
          `Duplicate plugin id: ${plugin.id}`
        );
      }

      pluginMap.set(plugin.id, plugin);
    }

    const resolved = [];
    const visiting = new Set();
    const visited = new Set();

    const visit = (plugin) => {
      if (visited.has(plugin.id)) {
        return;
      }

      if (visiting.has(plugin.id)) {
        throw new Error(
          `Circular plugin dependency detected: ${plugin.id}`
        );
      }

      visiting.add(plugin.id);

      const dependencies =
        plugin.dependencies ?? [];

      if (!Array.isArray(dependencies)) {
        throw new TypeError(
          `Plugin dependencies must be an array: ${plugin.id}`
        );
      }

      for (const dependencyId of dependencies) {
        const dependency =
          pluginMap.get(dependencyId);

        if (!dependency) {
          throw new Error(
            `Missing plugin dependency: ${plugin.id} -> ${dependencyId}`
          );
        }

        visit(dependency);
      }

      visiting.delete(plugin.id);
      visited.add(plugin.id);
      resolved.push(plugin);
    };

    for (const plugin of plugins) {
      visit(plugin);
    }

    return resolved;
  }
}