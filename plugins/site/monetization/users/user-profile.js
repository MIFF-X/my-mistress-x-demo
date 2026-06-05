export function createUserProfile(user) {
  const shell = document.createElement('section');
  shell.className = 'page-shell user-profile';

  const title = document.createElement('h2');
  title.innerText = user?.name || 'User Profile';

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <p><strong>Role:</strong> ${user?.role || 'unknown'}</p>
    <p><strong>Status:</strong> ${user?.status || 'unknown'}</p>
    <p><strong>Location:</strong> ${user?.location || 'unknown'}</p>
    <p>${user?.bio || 'No profile notes yet.'}</p>
  `;

  shell.appendChild(title);
  shell.appendChild(panel);
  return shell;
}
