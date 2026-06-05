export function getDefaultNextTasks(plugin) {
  const tasks = {
    frontend: [],
    backend: [],
    database: [],
    admin: [],
    safety: [],
  };

  if (!plugin.frontend || plugin.frontend.includes("needed") || plugin.frontend === "placeholder_needed") {
    tasks.frontend.push("Create/merge the real screen or route for this plugin.");
    tasks.frontend.push("Connect the visible scaffold card to the plugin route.");
    tasks.frontend.push("Add loading, empty, and error states.");
  }

  if (!plugin.backend || plugin.backend.includes("needed")) {
    tasks.backend.push("Create the API/service module for this plugin.");
    tasks.backend.push("Add create/read/update actions for the plugin workflow.");
    tasks.backend.push("Add audit logging for important plugin events.");
  }

  if (!plugin.database || plugin.database.includes("needed")) {
    tasks.database.push("Create database tables/schema for plugin records.");
    tasks.database.push("Add ownership, visibility, status, and timestamp fields.");
    tasks.database.push("Add indexes for user, Mistress, status, and createdAt lookups.");
  }

  if (!plugin.admin || plugin.admin.includes("needed") || plugin.admin.includes("approval") || plugin.admin.includes("moderation")) {
    tasks.admin.push("Add Headmistress/admin review or management panel.");
    tasks.admin.push("Add approve/reject/disable controls where relevant.");
    tasks.admin.push("Add reporting counters for command-centre visibility.");
  }

  if (plugin.safetyNotes?.length || plugin.status === "safety_review") {
    tasks.safety.push("Review consent, privacy, age-gating, moderation, and compliance requirements.");
    tasks.safety.push("Add explicit rules to block unsafe or non-compliant usage.");
    tasks.safety.push("Document final allowed/disallowed behaviours before launch.");
  }

  if (plugin.category === "money") {
    tasks.backend.push("Connect ledger entries to wallet balance calculations.");
    tasks.database.push("Add payment/payout provider transaction references.");
    tasks.admin.push("Add admin review queue for payment exceptions and payout approvals.");
  }

  if (plugin.category === "live") {
    tasks.frontend.push("Add timer/countdown and live-room access states.");
    tasks.backend.push("Add session lifecycle handling: scheduled, live, ended, replay.");
    tasks.safety.push("Add visible opt-in checks for camera, recording, screen share, or viewer participation.");
  }

  if (plugin.category === "marketplace") {
    tasks.database.push("Add stock, order, fulfilment, restock, and item compliance fields.");
    tasks.safety.push("Add allowed/prohibited item category rules and shipping compliance review.");
  }

  if (plugin.category === "smm") {
    tasks.backend.push("Add website linking, OAuth/API token storage, and publishing queues.");
    tasks.database.push("Add website, connectedAccount, contentQueue, and analytics tables.");
    tasks.safety.push("Add consent and platform-policy checks before auto-posting or syncing data.");
  }

  return tasks;
}

export function mergePluginNextTasks(plugin) {
  const defaults = getDefaultNextTasks(plugin);
  const custom = plugin.nextTasks || {};

  return {
    frontend: [...defaults.frontend, ...(custom.frontend || [])],
    backend: [...defaults.backend, ...(custom.backend || [])],
    database: [...defaults.database, ...(custom.database || [])],
    admin: [...defaults.admin, ...(custom.admin || [])],
    safety: [...defaults.safety, ...(custom.safety || [])],
  };
}
