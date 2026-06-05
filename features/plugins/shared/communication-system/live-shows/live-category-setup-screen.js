import { saveLiveCategorySetup } from "./live-category-setup-store.js";
import { createLiveHubScreen } from "./live-hub-screen.js";
import { ensureLiveSessionNavigationStyles, createLiveSessionTopBar } from "./live-session-navigation.js";
import { FREE_PREVIEW_OPTIONS, LIVE_LAYOUT_OPTIONS, LIVE_SHOW_CATEGORIES, TIER_PREVIEW_OPTIONS } from "./live-show-categories.js";

function createSelect(labelText, options, getValue, getLabel) {
  const wrapper = document.createElement("label");
  wrapper.className = "live-category-field";

  const label = document.createElement("span");
  label.innerText = labelText;

  const select = document.createElement("select");
  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = getValue(option);
    element.innerText = getLabel(option);
    select.appendChild(element);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return { wrapper, select };
}

function createTextInput(labelText, placeholder) {
  const wrapper = document.createElement("label");
  wrapper.className = "live-category-field";

  const label = document.createElement("span");
  label.innerText = labelText;

  const input = document.createElement("input");
  input.placeholder = placeholder;

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return { wrapper, input };
}

function ensureLiveCategorySetupStyles() {
  if (document.getElementById("live-category-setup-styles")) return;

  const style = document.createElement("style");
  style.id = "live-category-setup-styles";
  style.textContent = `
    .live-category-setup-screen {
      padding: 20px;
    }

    .live-category-setup-grid {
      display: grid;
      grid-template-columns: minmax(280px, 1fr) minmax(260px, 0.8fr);
      gap: 16px;
      margin-top: 16px;
    }

    .live-category-panel {
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(18,18,26,0.98), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.2);
    }

    .live-category-form {
      display: grid;
      gap: 12px;
    }

    .live-category-field {
      display: grid;
      gap: 6px;
    }

    .live-category-field span {
      color: rgba(255,255,255,0.72);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .live-category-field input,
    .live-category-field select {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(0,0,0,0.34);
      color: white;
      border-radius: 12px;
      padding: 10px 12px;
    }

    .live-category-preview-list {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }

    .live-category-preview-item {
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.05);
      border-radius: 14px;
      padding: 10px;
    }

    .live-category-summary-box,
    .live-category-save-status {
      margin-top: 12px;
      border: 1px solid rgba(212,175,55,0.24);
      background: rgba(212,175,55,0.08);
      border-radius: 14px;
      padding: 12px;
    }

    .live-category-save-status {
      border-color: rgba(29,158,117,0.35);
      background: rgba(29,158,117,0.1);
      color: rgba(255,255,255,0.82);
    }

    @media (max-width: 780px) {
      .live-category-setup-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

function createCategoryReferencePanel() {
  const panel = document.createElement("div");
  panel.className = "panel live-category-panel";

  const title = document.createElement("h3");
  title.innerText = "Available Categories";

  const list = document.createElement("div");
  list.className = "live-category-preview-list";

  LIVE_SHOW_CATEGORIES.forEach((category) => {
    const item = document.createElement("div");
    item.className = "live-category-preview-item";
    item.innerHTML = `<strong>${category.label}</strong><br><small>${category.description}</small>`;
    list.appendChild(item);
  });

  panel.appendChild(title);
  panel.appendChild(list);
  return panel;
}

export function createLiveCategorySetupScreen() {
  ensureLiveCategorySetupStyles();
  ensureLiveSessionNavigationStyles();

  const shell = document.createElement("div");
  shell.className = "page-shell live-category-setup-screen";

  const intro = document.createElement("p");
  intro.innerText = "Starter setup flow for choosing a live category, custom fallback label, layout, free-preview minutes, and subscription tier preview logic.";

  const grid = document.createElement("div");
  grid.className = "live-category-setup-grid";

  const formPanel = document.createElement("div");
  formPanel.className = "panel live-category-panel";

  const formTitle = document.createElement("h3");
  formTitle.innerText = "Room Setup";

  const form = document.createElement("div");
  form.className = "live-category-form";

  const roomTitle = createTextInput("Room Title", "Example: Friday Night Live");
  const category = createSelect("Category", LIVE_SHOW_CATEGORIES, (item) => item.id, (item) => item.label);
  const customCategory = createTextInput("Custom Category", "Only used when Miscellaneous / Custom is selected");
  const layout = createSelect("Viewing Layout", LIVE_LAYOUT_OPTIONS, (item) => item.id, (item) => item.label);
  const freePreview = createSelect("Free Preview", FREE_PREVIEW_OPTIONS, (item) => item.id, (item) => item.label);
  const tierPreview = createSelect("Tier Preview", TIER_PREVIEW_OPTIONS, (item) => item.tier, (item) => `${item.tier}: ${item.minutes} min`);

  const summary = document.createElement("div");
  summary.className = "live-category-summary-box";
  summary.innerText = "Select options to prepare the room setup summary.";

  const saveStatus = document.createElement("div");
  saveStatus.className = "live-category-save-status";
  saveStatus.innerText = "No draft saved yet.";

  function collectSetup() {
    const selectedCategory = LIVE_SHOW_CATEGORIES.find((item) => item.id === category.select.value);
    const selectedLayout = LIVE_LAYOUT_OPTIONS.find((item) => item.id === layout.select.value);
    const selectedPreview = FREE_PREVIEW_OPTIONS.find((item) => item.id === freePreview.select.value);
    const selectedTier = TIER_PREVIEW_OPTIONS.find((item) => item.tier === tierPreview.select.value);
    const customLabel = customCategory.input.value.trim();
    const categoryLabel = selectedCategory?.id === "misc" && customLabel ? customLabel : selectedCategory?.label;

    return {
      roomTitle: roomTitle.input.value || "Untitled live room",
      categoryId: selectedCategory?.id || "misc",
      categoryLabel,
      customCategory: customLabel,
      layoutId: selectedLayout?.id,
      layoutLabel: selectedLayout?.label,
      freePreviewId: selectedPreview?.id,
      freePreviewLabel: selectedPreview?.label,
      tierPreview: selectedTier?.tier,
      tierPreviewMinutes: selectedTier?.minutes,
      status: "draft"
    };
  }

  function updateSummary() {
    const setup = collectSetup();

    summary.innerHTML = `
      <strong>${setup.roomTitle}</strong><br>
      <small>Category: ${setup.categoryLabel}</small><br>
      <small>Layout: ${setup.layoutLabel}</small><br>
      <small>Free Preview: ${setup.freePreviewLabel}</small><br>
      <small>Tier Preview: ${setup.tierPreview} gets ${setup.tierPreviewMinutes} min</small>
    `;
  }

  [roomTitle.input, category.select, customCategory.input, layout.select, freePreview.select, tierPreview.select].forEach((field) => {
    field.addEventListener("input", updateSummary);
    field.addEventListener("change", updateSummary);
  });

  const saveButton = document.createElement("button");
  saveButton.className = "button-primary";
  saveButton.innerText = "Save Setup Draft";
  saveButton.onclick = () => {
    updateSummary();
    const saved = saveLiveCategorySetup(collectSetup());
    saveStatus.innerHTML = `<strong>Draft saved:</strong> ${saved.id}<br><small>${saved.roomTitle} · ${saved.categoryLabel} · ${saved.updatedAt}</small>`;
  };

  form.appendChild(roomTitle.wrapper);
  form.appendChild(category.wrapper);
  form.appendChild(customCategory.wrapper);
  form.appendChild(layout.wrapper);
  form.appendChild(freePreview.wrapper);
  form.appendChild(tierPreview.wrapper);
  form.appendChild(saveButton);
  form.appendChild(summary);
  form.appendChild(saveStatus);

  formPanel.appendChild(formTitle);
  formPanel.appendChild(form);

  grid.appendChild(formPanel);
  grid.appendChild(createCategoryReferencePanel());

  shell.appendChild(createLiveSessionTopBar("⚙️ Live Category Setup", createLiveHubScreen, "Live Hub"));
  shell.appendChild(intro);
  shell.appendChild(grid);

  updateSummary();

  return shell;
}
