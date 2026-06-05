import { createAppShell } from "./layouts/app-shell.js";
import { createButton } from "./features/ui/button.js";
import { createCard, createStatCard } from "./features/ui/card.js";
import { createDashboardModuleRegisterPlaceholder } from "./features/dashboard/dashboard-module-register-placeholder.js";
import { createDashboardArchitectureSummaryPlaceholder } from "./features/dashboard/dashboard-architecture-summary-placeholder.js";
import { createMistressUtilityHubPlaceholder } from "./features/dashboard/mistress-utility-hub-placeholder.js";
import { createStylingMarketplacePlaceholder } from "./features/styling/styling-marketplace-placeholder.js";
import { createPlatformPluginDashboardPlaceholder } from "./plugins/registry/platform-plugin-dashboard-placeholder.js";
import { createPlatformPluginDetailPlaceholder } from "./plugins/registry/platform-plugin-detail-placeholder.js";
import { createPluginGroupSummaryPlaceholder } from "./plugins/registry/plugin-group-summary-placeholder.js";
import { createBackendTaskDashboardPlaceholder } from "./plugins/registry/backend-task-dashboard-placeholder.js";
import { createFeatureProgressDashboardPlaceholder } from "./features/progress/feature-progress-dashboard-placeholder.js";
import { createTopUpPaymentOptionsPlaceholder } from "./features/money/top-up-payment-options-placeholder.js";
import { createEarningsVaultPlaceholder } from "./features/money/earnings-vault-placeholder.js";
import { createPpvContentLibraryPlaceholder } from "./features/content/ppv-content-library-placeholder.js";
import { createLiveShowsChatSidebarPlaceholder } from "./features/live/live-shows-chat-sidebar-placeholder.js";
import { createPaidCallsBookingsPlaceholder } from "./features/live/paid-calls-bookings-placeholder.js";
import { createStickerCollectorSystemPlaceholder } from "./features/collectibles/sticker-collector-system-placeholder.js";
import { createRolodexContactCardsPlaceholder } from "./features/rolodex/rolodex-contact-cards-placeholder.js";
import { createBadgeAwardsTrophySystemPlaceholder } from "./features/badges/badge-awards-trophy-system-placeholder.js";
import { createInteractiveInventoryEnvironmentsPlaceholder } from "./features/marketplace/interactive-inventory-environments-placeholder.js";
import { createSmmCommandCenterPlaceholder } from "./features/smm/smm-command-center-placeholder.js";
import { createHeadmistressCommandCentrePlaceholder } from "./features/admin/headmistress-command-centre-placeholder.js";
import { createComplianceShieldPlaceholder } from "./features/compliance/compliance-shield-placeholder.js";
import { createProfilePlaceholder } from "./features/profile/profile-placeholder.js";
import { createAdminPanelPlaceholder } from "./features/admin/admin-panel-placeholder.js";
import { createProductGridPlaceholder } from "./features/catalog/product-grid-placeholder.js";
import { createSearchFilterPlaceholder } from "./features/search/search-filter-placeholder.js";
import { createMessagingShellPlaceholder } from "./features/messaging/messaging-shell-placeholder.js";
import { createNotificationsPlaceholder } from "./features/notifications/notifications-placeholder.js";
import { createFileUploadPlaceholder } from "./features/uploads/file-upload-placeholder.js";
import { createSettingsPlaceholder } from "./features/settings/settings-placeholder.js";

const app = document.getElementById("app");

function setScreen(screenFactory) {
  const screen = screenFactory();
  const shell = createShell(screen);
  app.innerHTML = "";
  app.appendChild(shell);
}

function openDashboardModuleRegister() {
  setScreen(createDashboardModuleRegisterPlaceholder);
}

function openDashboardArchitectureSummary() {
  setScreen(createDashboardArchitectureSummaryPlaceholder);
}

function openMistressUtilityHub() {
  setScreen(createMistressUtilityHubPlaceholder);
}

function openTopUpPaymentOptions() {
  setScreen(() => createTopUpPaymentOptionsPlaceholder({
    onBack: () => openPluginRegistry("money"),
  }));
}

function openEarningsVault() {
  setScreen(() => createEarningsVaultPlaceholder({
    onBack: () => openPluginRegistry("money"),
  }));
}

function openPpvContentLibrary() {
  setScreen(() => createPpvContentLibraryPlaceholder({
    onBack: () => openPluginRegistry("content"),
  }));
}

function openLiveShowsChatSidebar() {
  setScreen(() => createLiveShowsChatSidebarPlaceholder({
    onBack: () => openPluginRegistry("live"),
  }));
}

function openPaidCallsBookings() {
  setScreen(() => createPaidCallsBookingsPlaceholder({
    onBack: () => openPluginRegistry("live"),
  }));
}

function openStickerCollectorSystem() {
  setScreen(() => createStickerCollectorSystemPlaceholder({
    onBack: () => openPluginRegistry("collectibles"),
  }));
}

function openRolodexContactCards() {
  setScreen(() => createRolodexContactCardsPlaceholder({
    onBack: () => openPluginRegistry("rolodex"),
  }));
}

function openBadgeAwardsTrophySystem() {
  setScreen(() => createBadgeAwardsTrophySystemPlaceholder({
    onBack: () => openPluginRegistry("badges"),
  }));
}

function openInteractiveInventoryEnvironments() {
  setScreen(() => createInteractiveInventoryEnvironmentsPlaceholder({
    onBack: () => openPluginRegistry("marketplace"),
  }));
}

function openSmmCommandCenter() {
  setScreen(() => createSmmCommandCenterPlaceholder({
    onBack: () => openPluginRegistry("smm"),
  }));
}

function openHeadmistressCommandCentre() {
  setScreen(() => createHeadmistressCommandCentrePlaceholder({
    onBack: () => openPluginRegistry("admin"),
  }));
}

function openComplianceShield() {
  setScreen(() => createComplianceShieldPlaceholder({
    onBack: () => openPluginRegistry("compliance"),
  }));
}

function openPluginDetail(plugin, backFilter = "all") {
  const pluginActions = [];

  if (plugin?.id === "top-up-payment-options") {
    pluginActions.push(
      createButton({ label: "Open Top-Up Screen", variant: "gold", onClick: openTopUpPaymentOptions }),
    );
  }

  if (plugin?.id === "earnings-vault") {
    pluginActions.push(
      createButton({ label: "Open Earnings Vault", variant: "gold", onClick: openEarningsVault }),
    );
  }

  if (plugin?.id === "ppv-content-library") {
    pluginActions.push(
      createButton({ label: "Open PPV Library", variant: "gold", onClick: openPpvContentLibrary }),
    );
  }

  if (plugin?.id === "live-shows-chat-sidebar") {
    pluginActions.push(
      createButton({ label: "Open Live Shows", variant: "gold", onClick: openLiveShowsChatSidebar }),
    );
  }

  if (plugin?.id === "paid-calls-bookings") {
    pluginActions.push(
      createButton({ label: "Open Paid Calls", variant: "gold", onClick: openPaidCallsBookings }),
    );
  }

  if (plugin?.id === "sticker-collector-system") {
    pluginActions.push(
      createButton({ label: "Open Sticker Collector", variant: "gold", onClick: openStickerCollectorSystem }),
    );
  }

  if (plugin?.id === "rolodex-contact-cards") {
    pluginActions.push(
      createButton({ label: "Open Rolodex Cards", variant: "gold", onClick: openRolodexContactCards }),
    );
  }

  if (plugin?.id === "badge-awards-trophy-system") {
    pluginActions.push(
      createButton({ label: "Open Badges", variant: "gold", onClick: openBadgeAwardsTrophySystem }),
    );
  }

  if (plugin?.id === "inventory-environments") {
    pluginActions.push(
      createButton({ label: "Open Inventory", variant: "gold", onClick: openInteractiveInventoryEnvironments }),
    );
  }

  if (plugin?.id === "smm-command-center") {
    pluginActions.push(
      createButton({ label: "Open SMM Command", variant: "gold", onClick: openSmmCommandCenter }),
    );
  }

  if (plugin?.id === "headmistress-command-centre") {
    pluginActions.push(
      createButton({ label: "Open Command Centre", variant: "gold", onClick: openHeadmistressCommandCentre }),
    );
  }

  if (plugin?.id === "compliance-shield") {
    pluginActions.push(
      createButton({ label: "Open Compliance Shield", variant: "gold", onClick: openComplianceShield }),
    );
  }

  setScreen(() => createPlatformPluginDetailPlaceholder({
    plugin,
    extraActions: pluginActions,
    onBack: () => setScreen(() => createPlatformPluginDashboardPlaceholder({
      onOpenPlugin: (selectedPlugin) => openPluginDetail(selectedPlugin, backFilter),
      initialFilter: backFilter,
    })),
  }));
}

function openPluginRegistry(initialFilter = "all") {
  setScreen(() => createPlatformPluginDashboardPlaceholder({
    initialFilter,
    onOpenPlugin: (plugin) => openPluginDetail(plugin, initialFilter),
  }));
}

function openBackendTasks(initialFilter = "all") {
  setScreen(() => createBackendTaskDashboardPlaceholder({ initialFilter }));
}

function createDashboardHome() {
  const page = document.createElement("section");
  page.className = "mx-page mx-stack";

  page.appendChild(
    createCard({
      eyebrow: "Feature Journey Progress",
      title: "Mistress-X app scaffold is now visible",
      description:
        "This entry point mounts the reusable scaffold into a real frontend page so future chunks can merge into the active app branch instead of staying hidden.",
      icon: "👑",
      actions: [
        createButton({ label: "Open Mistress Utility Hub", variant: "gold", onClick: openMistressUtilityHub }),
        createButton({ label: "Open Architecture Summary", variant: "secondary", onClick: openDashboardArchitectureSummary }),
        createButton({ label: "Open Dashboard Register", variant: "secondary", onClick: openDashboardModuleRegister }),
        createButton({ label: "Open Journey Progress", variant: "secondary", onClick: () => setScreen(createFeatureProgressDashboardPlaceholder) }),
        createButton({ label: "Open Compliance", variant: "secondary", onClick: openComplianceShield }),
        createButton({ label: "Open Command Centre", variant: "secondary", onClick: openHeadmistressCommandCentre }),
        createButton({ label: "Open SMM", variant: "secondary", onClick: openSmmCommandCenter }),
        createButton({ label: "Open Inventory", variant: "secondary", onClick: openInteractiveInventoryEnvironments }),
        createButton({ label: "Open Badges", variant: "secondary", onClick: openBadgeAwardsTrophySystem }),
        createButton({ label: "Open Rolodex", variant: "secondary", onClick: openRolodexContactCards }),
        createButton({ label: "Open Stickers", variant: "secondary", onClick: openStickerCollectorSystem }),
        createButton({ label: "Open Paid Calls", variant: "secondary", onClick: openPaidCallsBookings }),
        createButton({ label: "Open Live", variant: "secondary", onClick: openLiveShowsChatSidebar }),
        createButton({ label: "Open PPV Library", variant: "secondary", onClick: openPpvContentLibrary }),
        createButton({ label: "Open Top-Up", variant: "secondary", onClick: openTopUpPaymentOptions }),
        createButton({ label: "Open Earnings Vault", variant: "secondary", onClick: openEarningsVault }),
        createButton({ label: "Open Backend Tasks", variant: "secondary", onClick: () => openBackendTasks() }),
        createButton({ label: "Open Plugin Registry", variant: "secondary", onClick: () => openPluginRegistry() }),
        createButton({ label: "Open Styling Packs", variant: "secondary", onClick: () => setScreen(createStylingMarketplacePlaceholder) }),
        createButton({ label: "Open Uploads", variant: "secondary", onClick: () => setScreen(createFileUploadPlaceholder) }),
      ],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  [
    { label: "Scaffold", value: "100%", helper: "Visible frontend entry mounted", icon: "🧱", progress: 100 },
    { label: "Mistress Utilities", value: "100%", helper: "First-pass utility hub wired", icon: "👑", progress: 100 },
    { label: "Architecture", value: "100%", helper: "Summary screen wired", icon: "🧭", progress: 100 },
    { label: "Dashboard Register", value: "100%", helper: "Sub, Mistress, and Headmistress module map visible", icon: "🧭", progress: 100 },
    { label: "Progress", value: "100%", helper: "Central progress registry visible", icon: "📊", progress: 100 },
    { label: "Plugins", value: "100%", helper: "Central registry visible", icon: "🧩", progress: 100 },
    { label: "Plugin Groups", value: "100%", helper: "System summaries visible", icon: "🧭", progress: 100 },
    { label: "Compliance", value: "100%", helper: "Compliance shield screen visible", icon: "🛡️", progress: 100 },
    { label: "Command Centre", value: "100%", helper: "Headmistress command screen visible", icon: "👑", progress: 100 },
    { label: "SMM Command", value: "100%", helper: "SMM command screen visible", icon: "📣", progress: 100 },
    { label: "Inventory", value: "100%", helper: "Marketplace environment screen visible", icon: "🛍️", progress: 100 },
    { label: "Badges", value: "100%", helper: "Awards/trophy screen visible", icon: "🏆", progress: 100 },
    { label: "Rolodex", value: "100%", helper: "Contact cards screen visible", icon: "🗂️", progress: 100 },
    { label: "Stickers", value: "100%", helper: "Collector screen visible", icon: "🏷️", progress: 100 },
    { label: "Paid Calls", value: "100%", helper: "Booking/call screen visible", icon: "☎️", progress: 100 },
    { label: "Live Shows", value: "100%", helper: "Live interaction screen visible", icon: "📡", progress: 100 },
    { label: "PPV Library", value: "100%", helper: "Content monetisation screen visible", icon: "🎬", progress: 100 },
    { label: "Top-Up Screen", value: "100%", helper: "Money-in plugin screen visible", icon: "💰", progress: 100 },
    { label: "Earnings Vault", value: "100%", helper: "Money-out plugin screen visible", icon: "👛", progress: 100 },
    { label: "Backend Queue", value: "100%", helper: "Task dashboard visible", icon: "🗄️", progress: 100 },
    { label: "Assets", value: "80%", helper: "Folders and generated pack ready", icon: "🎨", progress: 80 },
    { label: "Favicon", value: "60%", helper: "SVG and manifest wired in HTML", icon: "💎", progress: 60 },
    { label: "Runtime Merge", value: "30%", helper: "Plain web entry created; Expo audit still pending", icon: "🧭", progress: 30 },
  ].forEach((item) => stats.appendChild(createStatCard(item)));

  page.appendChild(stats);
  page.appendChild(
    createPluginGroupSummaryPlaceholder({
      onOpenGroup: (groupId) => openPluginRegistry(groupId),
      onOpenBackendTasks: (groupId = "all") => openBackendTasks(groupId),
    }),
  );
  page.appendChild(createSearchFilterPlaceholder());
  return page;
}

function createShell(children) {
  return createAppShell({
    title: "Mistress-X App Branch",
    subtitle: "Visible scaffold entry for feature/abacus-ai-build",
    sidebarItems: [
      { icon: "🏠", label: "Dashboard", active: true, onClick: () => setScreen(createDashboardHome) },
      { icon: "👑", label: "Mistress Utilities", onClick: openMistressUtilityHub },
      { icon: "🧭", label: "Architecture", onClick: openDashboardArchitectureSummary },
      { icon: "🧭", label: "Dashboard Register", onClick: openDashboardModuleRegister },
      { icon: "📊", label: "Journey Progress", onClick: () => setScreen(createFeatureProgressDashboardPlaceholder) },
      { icon: "🛡️", label: "Compliance", onClick: openComplianceShield },
      { icon: "👑", label: "Command Centre", onClick: openHeadmistressCommandCentre },
      { icon: "📣", label: "SMM Command", onClick: openSmmCommandCenter },
      { icon: "🛍️", label: "Inventory", onClick: openInteractiveInventoryEnvironments },
      { icon: "🏆", label: "Badges", onClick: openBadgeAwardsTrophySystem },
      { icon: "🗂️", label: "Rolodex", onClick: openRolodexContactCards },
      { icon: "🏷️", label: "Stickers", onClick: openStickerCollectorSystem },
      { icon: "☎️", label: "Paid Calls", onClick: openPaidCallsBookings },
      { icon: "📡", label: "Live Shows", onClick: openLiveShowsChatSidebar },
      { icon: "🎬", label: "PPV Library", onClick: openPpvContentLibrary },
      { icon: "💰", label: "Top-Up", onClick: openTopUpPaymentOptions },
      { icon: "👛", label: "Earnings Vault", onClick: openEarningsVault },
      { icon: "🗄️", label: "Backend Tasks", onClick: () => openBackendTasks() },
      { icon: "🧩", label: "Plugin Registry", onClick: () => openPluginRegistry() },
      { icon: "👤", label: "Profile", onClick: () => setScreen(createProfilePlaceholder) },
      { icon: "👑", label: "Headmistress", onClick: () => setScreen(createAdminPanelPlaceholder) },
      { icon: "🛒", label: "Marketplace", onClick: () => setScreen(createProductGridPlaceholder) },
      { icon: "💬", label: "Messages", onClick: () => setScreen(createMessagingShellPlaceholder) },
      { icon: "🔔", label: "Notifications", onClick: () => setScreen(createNotificationsPlaceholder) },
      { icon: "🎨", label: "Styling Packs", onClick: () => setScreen(createStylingMarketplacePlaceholder) },
      { icon: "📤", label: "Uploads", onClick: () => setScreen(createFileUploadPlaceholder) },
      { icon: "⚙️", label: "Settings", onClick: () => setScreen(createSettingsPlaceholder) },
    ],
    actions: [
      createButton({ label: "Mistress Utilities", variant: "gold", onClick: openMistressUtilityHub }),
      createButton({ label: "Architecture", variant: "secondary", onClick: openDashboardArchitectureSummary }),
      createButton({ label: "Dashboard Register", variant: "secondary", onClick: openDashboardModuleRegister }),
      createButton({ label: "Progress", variant: "secondary", onClick: () => setScreen(createFeatureProgressDashboardPlaceholder) }),
      createButton({ label: "Compliance", variant: "secondary", onClick: openComplianceShield }),
      createButton({ label: "Command", variant: "secondary", onClick: openHeadmistressCommandCentre }),
      createButton({ label: "SMM", variant: "secondary", onClick: openSmmCommandCenter }),
      createButton({ label: "Inventory", variant: "secondary", onClick: openInteractiveInventoryEnvironments }),
      createButton({ label: "Badges", variant: "secondary", onClick: openBadgeAwardsTrophySystem }),
      createButton({ label: "Rolodex", variant: "secondary", onClick: openRolodexContactCards }),
      createButton({ label: "Stickers", variant: "secondary", onClick: openStickerCollectorSystem }),
      createButton({ label: "Calls", variant: "secondary", onClick: openPaidCallsBookings }),
      createButton({ label: "Live", variant: "secondary", onClick: openLiveShowsChatSidebar }),
      createButton({ label: "PPV", variant: "secondary", onClick: openPpvContentLibrary }),
      createButton({ label: "Top-Up", variant: "secondary", onClick: openTopUpPaymentOptions }),
      createButton({ label: "Vault", variant: "secondary", onClick: openEarningsVault }),
      createButton({ label: "Backend", variant: "secondary", onClick: () => openBackendTasks() }),
      createButton({ label: "Plugins", variant: "secondary", onClick: () => openPluginRegistry() }),
      createButton({ label: "Brand Assets", variant: "secondary", onClick: () => setScreen(createFileUploadPlaceholder) }),
    ],
    children: [children],
    footerText: "Mistress-X scaffold mounted for real app-branch integration.",
  });
}

setScreen(createDashboardHome);
