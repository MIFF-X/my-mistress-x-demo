export class PluginInstallation {
  constructor() {
    this.installedPlugins = new Set();
  }

  install(pluginId) {
    this.installedPlugins.add(pluginId);
  }

  uninstall(pluginId) {
    this.installedPlugins.delete(pluginId);
  }

  listInstalled() {
    return Array.from(this.installedPlugins);
  }
}
