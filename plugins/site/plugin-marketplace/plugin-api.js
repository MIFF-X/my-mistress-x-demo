export class PluginAPI {
  constructor() {
    this.plugins = new Map();
  }

  registerPlugin(pluginId, pluginInstance) {
    this.plugins.set(pluginId, pluginInstance);
  }

  unregisterPlugin(pluginId) {
    this.plugins.delete(pluginId);
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }
}
