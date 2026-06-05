import { paymentStore } from './payment-store.js';
import { userStore } from '../users/user-store.js';
import { createRolePicker } from '../../../../styles/dashboard/dashboard-role-picker.js';
import { createUserProfile } from '../users/user-profile.js';

export function createTopContributorsScreen() {
  const shell = document.createElement('div');
  shell.className = 'page-shell';

  const topRow = document.createElement('div');
  topRow.className = 'button-row';

  const backBtn = document.createElement('button');
  backBtn.className = 'button-secondary';
  backBtn.innerText = 'Back';
  backBtn.onclick = () => {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(createRolePicker());
  };
  topRow.appendChild(backBtn);

  const title = document.createElement('h2');
  title.innerText = 'Top Tribute Targets';

  const grid = document.createElement('div');
  grid.className = 'users-grid';

  const totalsByUser = {};

  paymentStore.history
    .filter((entry) => entry.type === 'tribute' && entry.toUserId)
    .forEach((entry) => {
      if (!totalsByUser[entry.toUserId]) {
        totalsByUser[entry.toUserId] = { total: 0, count: 0 };
      }
      totalsByUser[entry.toUserId].total += entry.amount;
      totalsByUser[entry.toUserId].count += 1;
    });

  const rankedUsers = userStore.users
    .filter((user) => totalsByUser[user.id])
    .sort((a, b) => totalsByUser[b.id].total - totalsByUser[a.id].total);

  if (rankedUsers.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'panel';
    empty.innerText = 'No tribute data yet.';
    grid.appendChild(empty);
  } else {
    rankedUsers.forEach((user, index) => {
      const card = document.createElement('div');
      card.className = 'panel';

      const rank = document.createElement('h3');
      rank.innerText = `#${index + 1} ${user.name}`;

      const info = document.createElement('p');
      info.innerText = `${user.role} - ${user.status} - ${user.location}`;

      const total = document.createElement('p');
      total.innerHTML = `<strong>Total Received:</strong> $${totalsByUser[user.id].total}`;

      const count = document.createElement('p');
      count.innerHTML = `<strong>Tributes:</strong> ${totalsByUser[user.id].count}`;

      const profileBtn = document.createElement('button');
      profileBtn.className = 'button-primary';
      profileBtn.innerText = 'View Profile';
      profileBtn.onclick = () => {
        const app = document.getElementById('app');
        app.innerHTML = '';
        app.appendChild(createUserProfile(user));
      };

      card.appendChild(rank);
      card.appendChild(info);
      card.appendChild(total);
      card.appendChild(count);
      card.appendChild(profileBtn);

      grid.appendChild(card);
    });
  }

  shell.appendChild(topRow);
  shell.appendChild(title);
  shell.appendChild(grid);

  return shell;
}
