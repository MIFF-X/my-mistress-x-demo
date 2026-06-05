import { subscriptionsApi } from './subscriptions-api.js';
import { getAuthRole } from '../auth/auth-client.js';

function createInput({ id, type = 'text', placeholder }) {
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.className = 'input-field';
  return input;
}

function createCheckbox({ id, label }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'checkbox-row';

  const input = document.createElement('input');
  input.id = id;
  input.type = 'checkbox';

  const span = document.createElement('span');
  span.innerText = label;

  wrapper.appendChild(input);
  wrapper.appendChild(span);

  return { wrapper, input };
}

function createButton(label, className = 'button-secondary') {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  return button;
}

function createTierSelect() {
  const select = document.createElement('select');
  select.className = 'input-field';

  ['BRONZE', 'SILVER', 'GOLD', 'VIP'].forEach((tier) => {
    const option = document.createElement('option');
    option.value = tier;
    option.innerText = tier;
    select.appendChild(option);
  });

  return select;
}

function createPlanForm(onCreated) {
  const form = document.createElement('div');
  form.className = 'panel subscription-plan-form';

  const title = document.createElement('h3');
  title.innerText = 'Create Subscription Plan';

  const nameInput = createInput({ id: 'sub-plan-name', placeholder: 'Plan name' });
  const priceInput = createInput({ id: 'sub-plan-price', type: 'number', placeholder: 'Monthly price in credits' });
  const tierSelect = createTierSelect();

  const chat = createCheckbox({ id: 'sub-plan-chat', label: 'Include chat unlocks' });
  const ppv = createCheckbox({ id: 'sub-plan-ppv', label: 'Include PPV access' });

  const ppvDiscountInput = createInput({ id: 'sub-plan-ppv-discount', type: 'number', placeholder: 'PPV discount %' });
  const giftDiscountInput = createInput({ id: 'sub-plan-gift-discount', type: 'number', placeholder: 'Gift discount %' });

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const submit = createButton('Create Plan', 'button-primary');
  submit.onclick = async () => {
    error.style.display = 'none';

    try {
      const plan = await subscriptionsApi.createPlan({
        name: nameInput.value || `${tierSelect.value} Plan`,
        price: Number(priceInput.value),
        tier: tierSelect.value,
        chatIncluded: chat.input.checked,
        ppvIncluded: ppv.input.checked,
        ppvDiscountPercent: Number(ppvDiscountInput.value || 0),
        giftDiscountPercent: Number(giftDiscountInput.value || 0),
        perks: {
          source: 'frontend_plan_creator',
        },
      });

      nameInput.value = '';
      priceInput.value = '';
      ppvDiscountInput.value = '';
      giftDiscountInput.value = '';
      chat.input.checked = false;
      ppv.input.checked = false;

      onCreated?.(plan);
    } catch (err) {
      error.innerText = err.message || 'Could not create subscription plan.';
      error.style.display = 'block';
    }
  };

  form.appendChild(title);
  form.appendChild(nameInput);
  form.appendChild(priceInput);
  form.appendChild(tierSelect);
  form.appendChild(chat.wrapper);
  form.appendChild(ppv.wrapper);
  form.appendChild(ppvDiscountInput);
  form.appendChild(giftDiscountInput);
  form.appendChild(error);
  form.appendChild(submit);

  return form;
}

function createPlanCard(plan, onSubscribe) {
  const card = document.createElement('article');
  card.className = 'panel subscription-plan-card';

  const title = document.createElement('h3');
  title.innerText = plan.name || `${plan.tier || 'BRONZE'} Plan`;

  const tier = document.createElement('strong');
  tier.innerText = plan.tier || 'BRONZE';

  const price = document.createElement('p');
  price.innerText = `${Number(plan.price || 0).toFixed(2)} credits / month`;

  const perks = document.createElement('ul');
  [
    plan.chatIncluded ? 'Chat unlocks included' : null,
    plan.ppvIncluded ? 'PPV access included' : null,
    plan.ppvDiscountPercent ? `${plan.ppvDiscountPercent}% off PPV` : null,
    plan.giftDiscountPercent ? `${plan.giftDiscountPercent}% off gifts` : null,
  ].filter(Boolean).forEach((perk) => {
    const item = document.createElement('li');
    item.innerText = perk;
    perks.appendChild(item);
  });

  const subscribeBtn = createButton('Subscribe', 'button-primary');
  subscribeBtn.onclick = async () => {
    await subscriptionsApi.subscribe(plan.id);
    subscribeBtn.innerText = 'Subscribed';
    subscribeBtn.disabled = true;
    onSubscribe?.(plan);
  };

  card.appendChild(title);
  card.appendChild(tier);
  card.appendChild(price);
  card.appendChild(perks);
  card.appendChild(subscribeBtn);

  return card;
}

export function createSubscriptionsPanel({ knownPlans = [], mistressUserId } = {}) {
  const shell = document.createElement('section');
  shell.className = 'page-shell subscriptions-panel';

  const title = document.createElement('h2');
  title.innerText = 'Subscriptions';

  const helper = document.createElement('p');
  helper.innerText = 'Create VIP plans, subscribe to access perks, and connect recurring value to wallet payments.';

  const status = document.createElement('p');
  status.className = 'subscription-status';

  const refreshBtn = createButton('Refresh Plans');

  const planList = document.createElement('div');
  planList.className = 'dashboard-card-grid subscription-plan-list';

  let plans = [...knownPlans];

  function renderPlans() {
    planList.innerHTML = '';

    if (plans.length === 0) {
      const empty = document.createElement('p');
      empty.innerText = 'No subscription plans loaded yet.';
      planList.appendChild(empty);
      return;
    }

    plans.forEach((plan) => {
      planList.appendChild(createPlanCard(plan, () => {
        status.innerText = `Subscribed to ${plan.name || plan.tier || 'plan'}.`;
      }));
    });
  }

  async function loadPlans() {
    status.innerText = 'Loading subscription plans...';

    try {
      plans = await subscriptionsApi.listPlans(mistressUserId);
      status.innerText = `${plans.length} subscription plan${plans.length === 1 ? '' : 's'} loaded.`;
      renderPlans();
    } catch (err) {
      status.innerText = err.message || 'Could not load subscription plans.';
      renderPlans();
    }
  }

  refreshBtn.onclick = loadPlans;

  shell.appendChild(title);
  shell.appendChild(helper);

  if (getAuthRole() === 'MISTRESS') {
    shell.appendChild(createPlanForm(async (plan) => {
      status.innerText = `Created plan: ${plan.name || plan.tier}.`;
      await loadPlans();
    }));
  }

  shell.appendChild(refreshBtn);
  shell.appendChild(status);
  shell.appendChild(planList);

  if (knownPlans.length) {
    renderPlans();
  }

  loadPlans();

  return shell;
}
