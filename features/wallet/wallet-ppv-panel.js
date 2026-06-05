import { getUserRole } from '../auth/role-client.js';
import { fetchPPVContent, fetchPPVHistory, fetchWalletBalance, purchasePPV } from './wallet-api.js';

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.history)) return data.history;
  return [];
}

export async function createWalletPPVPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel wallet-ppv-panel';
  panel.innerHTML = '<h3>Wallet + PPV</h3><p>Loading wallet and PPV data...</p>';

  const role = getUserRole();

  try {
    const wallet = await fetchWalletBalance();
    const balance = wallet?.balance ?? wallet?.credits ?? 0;

    panel.innerHTML = `
      <h3>Wallet + PPV</h3>
      <p><strong>Balance:</strong> $${balance}</p>
      <div class="icon-slot" id="wallet-pack-icons"></div>
    `;

    if (role === 'Mistress') {
      const history = normalizeList(await fetchPPVHistory());
      const revenue = history.reduce((sum, item) => sum + Number(item.price || item.amount || 0), 0);

      const earningsBlock = document.createElement('div');
      earningsBlock.className = 'wallet-role-block';
      earningsBlock.innerHTML = `
        <h4>Mistress Earnings</h4>
        <p><strong>PPV Sales:</strong> ${history.length}</p>
        <p><strong>Total PPV Revenue:</strong> $${revenue}</p>
      `;
      panel.appendChild(earningsBlock);
    }

    if (role === 'Sub') {
      const content = normalizeList(await fetchPPVContent({ type: 'available' }));
      const contentBlock = document.createElement('div');
      contentBlock.className = 'wallet-role-block';
      contentBlock.innerHTML = '<h4>Available PPV Unlocks</h4>';

      content.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'ppv-purchase-row';
        row.innerHTML = `
          <div>
            <strong>${item.title || 'PPV Unlock'}</strong>
            <p>${item.description || 'Paid content unlock'}</p>
            <small>${item.accessType || item.access_type || 'Timed / keep access'} · $${item.price ?? 0}</small>
          </div>
        `;

        const buyBtn = document.createElement('button');
        buyBtn.className = 'button-primary';
        buyBtn.innerText = 'Unlock';
        buyBtn.onclick = async () => {
          await purchasePPV(item.id);
          window.dispatchEvent(new CustomEvent('mx:ppv-purchased', {
            detail: {
              contentId: item.id,
              title: item.title || 'PPV Unlock',
              price: item.price ?? 0,
              packType: 'paid',
            },
          }));
        };

        row.appendChild(buyBtn);
        contentBlock.appendChild(row);
      });

      panel.appendChild(contentBlock);
    }
  } catch (error) {
    panel.innerHTML = `
      <h3>Wallet + PPV</h3>
      <p>Wallet/PPV data could not load yet. Keep this panel as the frontend mount while backend endpoints are connected.</p>
      <small>${error.message}</small>
    `;
  }

  return panel;
}
