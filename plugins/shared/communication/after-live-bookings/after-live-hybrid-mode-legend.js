export function createAfterLiveHybridModeLegend() {
  const legend = document.createElement("div");
  legend.className = "after-live-hybrid-mode-legend";

  const backendItem = document.createElement("span");
  backendItem.innerHTML = `<strong>Backend</strong> synced API booking`;

  const localItem = document.createElement("span");
  localItem.innerHTML = `<strong>Local</strong> browser demo fallback`;

  legend.appendChild(backendItem);
  legend.appendChild(localItem);

  return legend;
}

export function ensureAfterLiveHybridModeLegendStyles() {
  if (document.getElementById("after-live-hybrid-mode-legend-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-hybrid-mode-legend-styles";
  style.textContent = `
    .after-live-hybrid-mode-legend {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      margin: 10px 0 0;
    }

    .after-live-hybrid-mode-legend span {
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.18);
      color: rgba(255, 255, 255, 0.72);
      font-size: 12px;
    }

    .after-live-hybrid-mode-legend strong {
      color: #c6c1ff;
      margin-right: 4px;
      text-transform: uppercase;
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);
}
