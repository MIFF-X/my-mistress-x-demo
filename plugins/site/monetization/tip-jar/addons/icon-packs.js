/**
 * Mistress-X Tip Jar Icon Packs
 * Assets: Modular sets of icons for the Tip Jar Add-on.
 */

const TipJarIconPacks = {
    "Classic": ["☕", "👜", "🥂", "💅"],
    "Luxury": ["💎", "🍾", "🏎️", "👑"],
    "Bratty": ["🍭", "💸", "👠", "💳"],
    "Seasonal": ["🎃", "🎄", "🎁", "💖"]
};

// Available Naming Presets
const TipJarNamingPresets = [
    "Tickle Her Fancy",
    "Add to Mistress's Purse",
    "Top Up Mistress",
    "Buy Mistress a Coffee",
    "Feed the Shopping Addiction",
    "Monthly Maintenance",
    "Custom..."
];

if (typeof window !== 'undefined') {
    window.TipJarIconPacks = TipJarIconPacks;
    window.TipJarNamingPresets = TipJarNamingPresets;
}
