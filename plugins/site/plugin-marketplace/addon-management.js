export class AddonManagement {
  constructor() {
    this.addons = new Map();
  }

  addAddon(pluginId, addon) {
    if (!this.addons.has(pluginId)) {
      this.addons.set(pluginId, []);
    }
    this.addons.get(pluginId).push(addon);
  }

  getAddons(pluginId) {
    return this.addons.get(pluginId) || [];
  }
}
