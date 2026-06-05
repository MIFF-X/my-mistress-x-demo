/**
 * Mistress-X Monetization Registry Middleware
 *
 * Central registry for monetization integrations used by UI/plugin layers.
 */

const MonetizationRegistry = {
  providers: new Map(),

  register(name, config) {
    this.providers.set(name, config);
  },

  get(name) {
    return this.providers.get(name) || null;
  },

  list() {
    return Array.from(this.providers.keys());
  }
};

window.MonetizationRegistry = MonetizationRegistry;
