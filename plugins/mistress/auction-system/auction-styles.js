export function ensureAuctionStyles() {
  if (document.getElementById("mistress-x-auction-plugin-styles")) return;

  const style = document.createElement("style");
  style.id = "mistress-x-auction-plugin-styles";
  style.textContent = `
    .mx-auction-page { color: #fff; }
    .mx-auction-hero,
    .mx-auction-panel,
    .mx-auction-commerce-tray {
      border: 1px solid rgba(242, 201, 76, 0.22);
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(18, 14, 25, 0.96), rgba(8, 8, 12, 0.96));
      box-shadow: 0 18px 45px rgba(0,0,0,0.28);
    }
    .mx-auction-hero { display:flex; justify-content:space-between; gap:20px; padding:24px; align-items:flex-start; }
    .mx-auction-hero small,
    .mx-auction-panel-heading small,
    .mx-auction-tray-active small,
    .mx-auction-stage-attached-list small { color:#f2c94c; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; }
    .mx-auction-hero h2,
    .mx-auction-panel h3,
    .mx-auction-lot-card h3 { margin:4px 0; }
    .mx-auction-hero p,
    .mx-auction-description,
    .mx-auction-lot-top p,
    .mx-auction-addon-card p { color:rgba(255,255,255,0.68); line-height:1.45; }
    .mx-auction-hero-actions,
    .mx-auction-actions,
    .mx-auction-filter-row,
    .mx-auction-tray-mode-row,
    .mx-auction-pill-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
    .mx-auction-stats-grid,
    .mx-auction-lot-grid,
    .mx-auction-addon-grid,
    .mx-auction-live-grid,
    .mx-auction-manager-grid { display:grid; gap:14px; margin-top:14px; }
    .mx-auction-stats-grid { grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); }
    .mx-auction-manager-grid { grid-template-columns:minmax(0,1.45fr) minmax(320px,0.75fr); }
    .mx-auction-lot-grid { grid-template-columns:repeat(auto-fit,minmax(275px,1fr)); }
    .mx-auction-addon-grid { grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); }
    .mx-auction-live-grid { grid-template-columns:minmax(0,1fr) minmax(220px,0.45fr); }
    .mx-auction-stat,
    .mx-auction-lot-card,
    .mx-auction-addon-card,
    .mx-auction-nft-box,
    .mx-auction-tray-active,
    .mx-auction-stage-attached-list {
      border:1px solid rgba(255,255,255,0.1);
      border-radius:16px;
      background:rgba(255,255,255,0.055);
      padding:13px;
    }
    .mx-auction-stat span { font-size:24px; }
    .mx-auction-stat small,
    .mx-auction-bid-row small,
    .mx-auction-history strong,
    .mx-auction-history span,
    .mx-auction-stage-attached-list span { display:block; color:rgba(255,255,255,0.62); }
    .mx-auction-stat strong { display:block; margin-top:5px; font-size:24px; color:#fff; }
    .mx-auction-panel { padding:16px; margin-top:18px; }
    .mx-auction-panel-heading { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:12px; }
    .mx-auction-panel-heading span { color:rgba(255,255,255,0.56); font-size:12px; }
    .mx-auction-lot-top { display:flex; align-items:flex-start; gap:10px; }
    .mx-auction-lot-icon { display:grid; place-items:center; width:46px; height:46px; border-radius:14px; background:rgba(242,201,76,0.14); font-size:24px; flex:0 0 auto; }
    .mx-auction-status { margin-left:auto; border-radius:999px; padding:4px 8px; font-size:11px; font-weight:900; border:1px solid rgba(255,255,255,0.12); color:#fff; text-transform:uppercase; }
    .mx-auction-status-live { color:#9ff5d3; border-color:rgba(29,158,117,0.42); background:rgba(29,158,117,0.12); }
    .mx-auction-status-sold { color:#ff9a9a; border-color:rgba(255,90,90,0.42); background:rgba(255,90,90,0.12); }
    .mx-auction-bid-row { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:12px 0; }
    .mx-auction-bid-row div { border-radius:12px; padding:10px; background:rgba(0,0,0,0.22); }
    .mx-auction-bid-row strong { display:block; margin-top:4px; color:#f2c94c; }
    .mx-auction-pill { display:inline-flex; border:1px solid rgba(255,255,255,0.12); border-radius:999px; padding:4px 8px; color:rgba(255,255,255,0.75); font-size:11px; font-weight:800; }
    .mx-auction-pill.is-active { color:#f2c94c; border-color:rgba(242,201,76,0.38); background:rgba(242,201,76,0.1); }
    .mx-auction-nft-box { margin-top:12px; color:#d7ccff; border-color:rgba(151,130,255,0.3); background:rgba(151,130,255,0.08); }
    .mx-auction-actions { margin-top:12px; }
    .mx-auction-btn,
    .mx-auction-mode-btn {
      border:1px solid rgba(255,255,255,0.14);
      border-radius:12px;
      padding:9px 12px;
      background:rgba(255,255,255,0.07);
      color:white;
      cursor:pointer;
      font-weight:900;
    }
    .mx-auction-btn.primary,
    .mx-auction-mode-btn.is-active { background:linear-gradient(135deg,#f2c94c,#fff0a8); color:#111; border-color:rgba(242,201,76,0.8); }
    .mx-auction-btn.danger { background:rgba(255,68,68,0.16); color:#ff9a9a; border-color:rgba(255,68,68,0.36); }
    .mx-auction-btn:disabled { opacity:0.45; cursor:not-allowed; }
    .mx-auction-history { margin-top:12px; border-top:1px solid rgba(255,255,255,0.08); padding-top:9px; font-size:12px; }
    .mx-auction-form { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
    .mx-auction-form-grid.compact { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-top:10px; }
    .mx-auction-form label { display:grid; gap:5px; color:rgba(255,255,255,0.72); font-size:12px; font-weight:800; }
    .mx-auction-form input,
    .mx-auction-form select,
    .mx-auction-form textarea,
    .mx-auction-stage-select-row select { width:100%; border:1px solid rgba(255,255,255,0.13); border-radius:12px; background:#101016; color:white; padding:10px; }
    .mx-auction-form textarea { min-height:88px; resize:vertical; }
    .mx-auction-form-wide { grid-column:1 / -1; }
    .mx-auction-addon-checks { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:8px; border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px; background:rgba(0,0,0,0.16); }
    .mx-auction-addon-checks strong { grid-column:1 / -1; color:#f2c94c; }
    .mx-auction-addon-card span { font-size:26px; }
    .mx-auction-addon-card strong { display:block; margin:8px 0 4px; color:#fff; }
    .mx-auction-live-controls { display:grid; gap:8px; align-content:start; }
    .mx-auction-commerce-tray { padding:10px; color:white; }
    #live-commerce-tray-slot .mx-auction-commerce-tray { position:absolute; left:18px; bottom:18px; z-index:31; width:min(430px,calc(100% - 36px)); backdrop-filter:blur(12px); }
    .mx-auction-commerce-tray.is-compact { background:rgba(10,10,14,0.92); }
    .mx-auction-tray-header { width:100%; display:flex; justify-content:space-between; align-items:center; gap:10px; background:transparent; border:0; color:white; text-align:left; cursor:pointer; }
    .mx-auction-tray-header strong,
    .mx-auction-tray-header small { display:block; }
    .mx-auction-tray-header small { color:rgba(255,255,255,0.62); font-size:11px; }
    .mx-auction-tray-header em { color:#f2c94c; border:1px solid rgba(242,201,76,0.38); border-radius:999px; padding:4px 8px; font-style:normal; font-size:11px; font-weight:900; }
    .mx-auction-tray-body { margin-top:10px; display:grid; gap:10px; }
    .mx-auction-stage-select-row { display:flex; gap:8px; align-items:stretch; }
    .mx-auction-stage-select-row select { min-width:0; flex:1; }
    .mx-auction-stage-attached-list span { margin-top:5px; }
    .mx-auction-stage-attached-list em { float:right; color:#f2c94c; font-style:normal; font-size:10px; }
    .mx-auction-tray-addons { display:flex; flex-wrap:wrap; gap:6px; }
    @media (max-width: 920px) {
      .mx-auction-hero,
      .mx-auction-panel-heading { flex-direction:column; }
      .mx-auction-manager-grid,
      .mx-auction-live-grid { grid-template-columns:1fr; }
      .mx-auction-form { grid-template-columns:1fr; }
      #live-commerce-tray-slot .mx-auction-commerce-tray { position:static; width:100%; margin-top:10px; }
    }
  `;
  document.head.appendChild(style);
}
