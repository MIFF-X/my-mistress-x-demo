import { clearLiveCategorySetups, getLiveCategorySetups } from "./live-category-setup-store.js";

function ensureSetupListStyles() {
  if (document.getElementById("live-category-setups-list-styles")) return;

  const style = document.createElement("style");
  style.id = "live-category-setups-list-styles";
  style.textContent = `
    .live-category-setups-list {
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(18,18,26,0.98), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.2);
    }

    .live-category-setups-rows {
      display: grid;
      gap: 8px;
      margin-top: 12px;
      max-height: 340px;
      overflow: auto;
      padding-right: 4px;
    }

    .live-category-setup-row {
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.05);
      border-radius: 14px;
      padding: 10px;
    }

    .live-category-setup-row strong {
      display: block;
      color: #d4af37;
    }

    .live-category-setup-row small {
      display: block;
      margin-top: 4px;
      color: rgba(255,255,255,0.68);
    }

    .live-category-setups-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
  `;
  document.head.appendChild(style);
}

function createSetupRow(setup) {
  const row = document.createElement("div");
  row.className = "live-category-setup-row";
  row.innerHTML = `
    <strong>${setup.roomTitle}</strong>
    <small>${setup.categoryLabel} · ${setup.layoutLabel} · ${setup.freePreviewLabel}</small>
    <small>${setup.tierPreview} preview: ${setup.tierPreviewMinutes} min · ${setup.status}</small>
    <small>Updated: ${new Date(setup.updatedAt).toLocaleString()}</small>
  `;
  return row;
}

export function createLiveCategorySetupsList() {
  ensureSetupListStyles();

  const panel = document.createElement("div");
  panel.className = "panel live-category-setups-list";

  const title = document.createElement("h3");
  title.innerText = "💾 Saved Setup Drafts";

  const helper = document.createElement("p");
  helper.innerText = "Local starter list of saved live room setup drafts.";

  const rows = document.createElement("div");
  rows.className = "live-category-setups-rows";

  const setups = getLiveCategorySetups();
  if (setups.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No setup drafts saved yet. Open Category Setup and save a draft.";
    rows.appendChild(empty);
  } else {
    setups.slice(0, 25).forEach((setup) => rows.appendChild(createSetupRow(setup)));
  }

  const actions = document.createElement("div");
  actions.className = "live-category-setups-actions";

  const refreshBtn = document.createElement("button");
  refreshBtn.className = "button-secondary";
  refreshBtn.type = "button";
  refreshBtn.innerText = "Refresh";
  refreshBtn.onclick = () => panel.replaceWith(createLiveCategorySetupsList());

  const clearBtn = document.createElement("button");
  clearBtn.className = "button-secondary";
  clearBtn.type = "button";
  clearBtn.innerText = "Clear Drafts";
  clearBtn.onclick = () => {
    clearLiveCategorySetups();
    panel.replaceWith(createLiveCategorySetupsList());
  };

  actions.appendChild(refreshBtn);
  actions.appendChild(clearBtn);

  panel.appendChild(title);
  panel.appendChild(helper);
  panel.appendChild(rows);
  panel.appendChild(actions);

  return panel;
}
