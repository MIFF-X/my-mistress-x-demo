/**
 * Mistress-X Tip Jar Logic Middleware
 * Logic: Manages naming, icons, and marketplace addon activation.
 */

const TipJarLogic = {
    // Default Settings for a new Mistress
    defaultSettings: {
        name: "Tickle Her Fancy",
        icon: "☕",
        active: true,
        installedPacks: ["Classic"]
    },

    // 1. Fetch Mistress-Specific Settings
    getSettings: (mistressId) => {
        // In full production, this fetches from the User_Settings DB table
        const saved = localStorage.getItem(`tipjar_${mistressId}`);
        return saved ? JSON.parse(saved) : TipJarLogic.defaultSettings;
    },

    // 2. Logic to update settings (called by Mistress Dashboard)
    updateSettings: (mistressId, newSettings) => {
        const current = TipJarLogic.getSettings(mistressId);
        const updated = { ...current, ...newSettings };
        
        localStorage.setItem(`tipjar_${mistressId}`, JSON.stringify(updated));
        
        // Push Live Update via Socket.IO
        if (window.socket) {
            window.socket.emit('tipjar:update_pushed', { mistressId, updated });
        }
        console.log(`[Tip Jar Middleware] Settings Updated for ${mistressId}`);
    },

    // 3. Logic to "Install" a new Icon Pack Add-on from the Marketplace
    installAddonPack: (mistressId, packName) => {
        const settings = TipJarLogic.getSettings(mistressId);
        if (!settings.installedPacks.includes(packName)) {
            settings.installedPacks.push(packName);
            TipJarLogic.updateSettings(mistressId, settings);
            alert(`New Add-on Pack: ${packName} Installed!`);
        }
    }
};

window.TipJarLogic = TipJarLogic;
