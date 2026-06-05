import { subscriptionApi } from '../../api/subscription-api.js';

export async function createSubscriptionUI(mistressUserId) {
  const container = document.createElement('div');
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
  container.style.gap = '12px';

  const plans = await subscriptionApi.listPlans(mistressUserId);
  const activeSubs = await subscriptionApi.status(mistressUserId);

  for (const plan of plans) {
    const card = document.createElement('div');
    card.style.border = '1px solid #444';
    card.style.padding = '12px';
    card.style.background = '#111';

    const title = document.createElement('h3');
    title.innerText = `${plan.name} (${plan.tier})`;

    const price = document.createElement('div');
    price.innerText = `${plan.price} / ${plan.billingCycle}`;

    const perks = document.createElement('ul');

    if (plan.chatIncluded) {
      const li = document.createElement('li');
      li.innerText = 'Free Chat Unlock';
      perks.appendChild(li);
    }

    if (plan.ppvIncluded) {
      const li = document.createElement('li');
      li.innerText = 'All PPV Included';
      perks.appendChild(li);
    }

    if (plan.ppvDiscountPercent > 0) {
      const li = document.createElement('li');
      li.innerText = `${plan.ppvDiscountPercent}% off PPV`;
      perks.appendChild(li);
    }

    if (plan.giftDiscountPercent > 0) {
      const li = document.createElement('li');
      li.innerText = `${plan.giftDiscountPercent}% off Gifts`;
      perks.appendChild(li);
    }

    const isActive = activeSubs.some(s => s.planId === plan.id);

    const btn = document.createElement('button');
    btn.innerText = isActive ? 'Subscribed' : 'Subscribe';
    btn.disabled = isActive;

    btn.onclick = async () => {
      try {
        await subscriptionApi.subscribe(plan.id);
        btn.innerText = 'Subscribed';
        btn.disabled = true;
      } catch (e) {
        alert(e.message);
      }
    };

    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(perks);
    card.appendChild(btn);

    container.appendChild(card);
  }

  return container;
}
