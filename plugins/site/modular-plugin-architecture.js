// Modular Plugin Architecture - Core logic for plugin system

export class ModularPluginArchitecture {
  constructor() {
    this.plugins = new Map(); // pluginId -> plugin instance
  }

  installPlugin(pluginId, pluginInstance) {
    this.plugins.set(pluginId, pluginInstance);
    console.log(`Installed plugin: ${pluginId}`);
  }

  uninstallPlugin(pluginId) {
    this.plugins.delete(pluginId);
    console.log(`Uninstalled plugin: ${pluginId}`);
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  listPlugins() {
    return Array.from(this.plugins.keys());
  }

  // TODO: Add lifecycle management and event hooks
}
