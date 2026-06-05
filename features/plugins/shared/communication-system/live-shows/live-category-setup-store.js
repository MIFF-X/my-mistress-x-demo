const STORAGE_KEY = "mxLiveCategorySetups";

function readSetups() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function writeSetups(setups) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(setups));
}

export function saveLiveCategorySetup(setup) {
  const setups = readSetups();
  const savedSetup = {
    id: setup.id || `setup_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    roomTitle: setup.roomTitle || "Untitled live room",
    categoryId: setup.categoryId || "misc",
    categoryLabel: setup.categoryLabel || "Miscellaneous or Custom",
    customCategory: setup.customCategory || "",
    layoutId: setup.layoutId || "single",
    layoutLabel: setup.layoutLabel || "Single player",
    freePreviewId: setup.freePreviewId || "none",
    freePreviewLabel: setup.freePreviewLabel || "No free preview",
    tierPreview: setup.tierPreview || "Guest",
    tierPreviewMinutes: setup.tierPreviewMinutes ?? 0.5,
    status: setup.status || "draft",
    createdAt: setup.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  writeSetups([savedSetup, ...setups].slice(0, 50));
  return savedSetup;
}

export function getLiveCategorySetups() {
  return readSetups();
}

export function getLatestLiveCategorySetup() {
  return readSetups()[0] || null;
}

export function clearLiveCategorySetups() {
  writeSetups([]);
}
