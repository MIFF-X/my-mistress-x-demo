// Service Offering - Manage sub professional skills and offerings

export class ServiceOffering {
  constructor() {
    this.services = new Map(); // subId -> Array of services
  }

  addService(subId, service) {
    if (!this.services.has(subId)) {
      this.services.set(subId, []);
    }
    this.services.get(subId).push(service);
    console.log(`Added service for sub ${subId}:`, service);
  }

  getServices(subId) {
    return this.services.get(subId) || [];
  }

  // TODO: Add methods for service approval and rating
}
