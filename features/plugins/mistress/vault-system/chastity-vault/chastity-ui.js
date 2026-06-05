export function createChastityVault() {
    const container = document.createElement("div");
    container.className = "chastity-container";

    container.innerHTML = `
        <div style="background:#111; padding:30px; border:1px solid #444; border-radius:15px; text-align:center;">
             <div style="font-size:60px; margin-bottom:10px;">🔒</div>
             <h2 style="color:#00d4ff;">Chastity Vault</h2>
             
             <div id="vault-list" style="margin-top:20px; text-align:left;">
                <div class="vault-entry" style="background:#000; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid #ff4444;">
                    <div>
                        <strong style="display:block;">Sub: SlaveX</strong>
                        <span style="font-size:12px; color:#888;">Locked for: 48h 12m</span>
                    </div>
                    <button style="background:#00ff66; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer;">RELEASE ($50)</button>
                </div>
                
                <div class="vault-entry" style="background:#000; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid #00d4ff;">
                    <div>
                        <strong style="display:block;">Sub: Petual</strong>
                        <span style="font-size:12px; color:#888;">Locked for: 12h 05m</span>
                    </div>
                    <button style="background:#444; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; color:white;">EXTEND ($10)</button>
                </div>
             </div>
        </div>
    `;

    return container;
}
