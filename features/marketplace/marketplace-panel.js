import { marketplaceApi } from './marketplace-api.js';
import { getAuthRole } from '../auth/auth-client.js';
import { createReportButton } from '../dashboard/report-action.js';

function createInput({ id, type = 'text', placeholder }) {
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.className = 'input-field';
  return input;
}

function createButton(label, className = 'button-secondary') {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  return button;
}

function formatCredits(value) {
  return `${Number(value || 0).toFixed(2)} credits`;
}

function createProductCard(product, statusEl, onPurchased) {
  const card = document.createElement('article');
  card.className = 'panel marketplace-product-card';

  const title = document.createElement('h3');
  title.innerText = product.title || 'Untitled Product';

  const meta = document.createElement('p');
  meta.innerText = `${product.type || 'STANDARD'} · ${formatCredits(product.price)} · Stock: ${product.stock ?? 0}`;

  const description = document.createElement('p');
  description.innerText = product.description || 'No description provided.';

  const actions = document.createElement('div');
  actions.className = 'button-row';

  const purchaseBtn = createButton('Purchase', 'button-primary');
  purchaseBtn.disabled = Number(product.stock || 0) <= 0;
  purchaseBtn.onclick = async () => {
    try {
      await marketplaceApi.purchase(product.id);
      statusEl.innerText = `Purchased ${product.title || 'product'}.`;
      purchaseBtn.innerText = 'Purchased';
      purchaseBtn.disabled = true;
      await onPurchased?.();
    } catch (err) {
      statusEl.innerText = err.message || 'Could not purchase product.';
    }
  };

  const reportBtn = createReportButton({
    label: 'Report product',
    title: `Reported product: ${product.title || product.id}`,
    description: product.description || 'Marketplace product reported from marketplace panel.',
    targetType: 'marketplace',
    targetId: product.id,
    targetUserId: product.mistressId,
    area: 'MARKETPLACE',
    priority: 'HIGH',
    metadata: {
      price: product.price,
      stock: product.stock,
      productType: product.type,
    },
    onCreated: () => {
      statusEl.innerText = 'Product report sent to moderation.';
    },
    onError: (error) => {
      statusEl.innerText = error.message || 'Could not report product.';
    },
  });

  actions.appendChild(purchaseBtn);
  actions.appendChild(reportBtn);

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(description);
  card.appendChild(actions);

  return card;
}

function createProductForm(onCreated) {
  const form = document.createElement('div');
  form.className = 'panel marketplace-product-form';

  const title = document.createElement('h3');
  title.innerText = 'Create Marketplace Product';

  const titleInput = createInput({ id: 'product-title', placeholder: 'Product title' });
  const descriptionInput = createInput({ id: 'product-description', placeholder: 'Description' });
  const priceInput = createInput({ id: 'product-price', type: 'number', placeholder: 'Price in credits' });
  const typeInput = createInput({ id: 'product-type', placeholder: 'Type e.g. STANDARD, WORN_ITEM, DIGITAL_COLLECTIBLE' });
  const stockInput = createInput({ id: 'product-stock', type: 'number', placeholder: 'Stock quantity' });

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const submit = createButton('Create Product', 'button-primary');
  submit.onclick = async () => {
    error.style.display = 'none';

    try {
      const product = await marketplaceApi.createProduct({
        title: titleInput.value,
        description: descriptionInput.value,
        price: Number(priceInput.value || 0),
        type: typeInput.value || 'STANDARD',
        stock: Number(stockInput.value || 1),
      });

      titleInput.value = '';
      descriptionInput.value = '';
      priceInput.value = '';
      typeInput.value = '';
      stockInput.value = '';

      await onCreated?.(product);
    } catch (err) {
      error.innerText = err.message || 'Could not create marketplace product.';
      error.style.display = 'block';
    }
  };

  form.appendChild(title);
  form.appendChild(titleInput);
  form.appendChild(descriptionInput);
  form.appendChild(priceInput);
  form.appendChild(typeInput);
  form.appendChild(stockInput);
  form.appendChild(error);
  form.appendChild(submit);

  return form;
}

export function createMarketplacePanel() {
  const shell = document.createElement('section');
  shell.className = 'page-shell marketplace-panel';

  const title = document.createElement('h2');
  title.innerText = 'Marketplace / Inventory';

  const helper = document.createElement('p');
  helper.innerText = 'Create products, browse inventory, and purchase through the wallet-backed marketplace flow.';

  const status = document.createElement('p');
  status.className = 'marketplace-status';

  const refreshBtn = createButton('Refresh Products');

  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid marketplace-product-grid';

  async function loadProducts() {
    grid.innerHTML = '';

    try {
      const products = await marketplaceApi.listProducts();

      if (!Array.isArray(products) || products.length === 0) {
        const empty = document.createElement('p');
        empty.innerText = 'No marketplace products yet.';
        grid.appendChild(empty);
        return;
      }

      products.forEach((product) => {
        grid.appendChild(createProductCard(product, status, loadProducts));
      });
    } catch (err) {
      status.innerText = err.message || 'Could not load products.';
    }
  }

  refreshBtn.onclick = loadProducts;

  shell.appendChild(title);
  shell.appendChild(helper);

  if (getAuthRole() === 'MISTRESS') {
    shell.appendChild(createProductForm(async (product) => {
      status.innerText = `Created product: ${product.title || 'product'}.`;
      await loadProducts();
    }));
  }

  shell.appendChild(refreshBtn);
  shell.appendChild(status);
  shell.appendChild(grid);

  loadProducts();

  return shell;
}
