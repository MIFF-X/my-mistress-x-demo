import { loginUser, registerUser } from './auth-client.js';
import { mountDashboardForCurrentUser } from './role-router.js';

function createInput({ id, type = 'text', placeholder }) {
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.className = 'input-field';
  return input;
}

function createRoleSelect() {
  const select = document.createElement('select');
  select.id = 'auth-role';
  select.className = 'input-field';

  const sub = document.createElement('option');
  sub.value = 'SUB';
  sub.innerText = 'Sub';

  const mistress = document.createElement('option');
  mistress.value = 'MISTRESS';
  mistress.innerText = 'Mistress';

  select.appendChild(sub);
  select.appendChild(mistress);

  return select;
}

function mountAfterAuth(appElement, routeFactories) {
  mountDashboardForCurrentUser(appElement, routeFactories);
}

export function createAuthScreen({
  mode = 'login',
  routeFactories = {},
  appElement = document.getElementById('app'),
  onAuthenticated,
} = {}) {
  const isRegister = mode === 'register';

  const shell = document.createElement('section');
  shell.className = 'page-shell auth-screen';

  const title = document.createElement('h1');
  title.innerText = isRegister ? 'Create Mistress-X Account' : 'Login to Mistress-X';

  const helper = document.createElement('p');
  helper.innerText = isRegister
    ? 'Choose your role and create your platform identity.'
    : 'Login to continue to your role-based dashboard.';

  const form = document.createElement('div');
  form.className = 'panel auth-panel';

  const emailInput = createInput({ id: 'auth-email', type: 'email', placeholder: 'Email' });
  const passwordInput = createInput({ id: 'auth-password', type: 'password', placeholder: 'Password' });

  form.appendChild(emailInput);

  let usernameInput = null;
  let roleSelect = null;

  if (isRegister) {
    usernameInput = createInput({ id: 'auth-username', placeholder: 'Username' });
    roleSelect = createRoleSelect();
    form.appendChild(usernameInput);
    form.appendChild(roleSelect);
  }

  form.appendChild(passwordInput);

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const submit = document.createElement('button');
  submit.className = 'button-primary';
  submit.innerText = isRegister ? 'Register' : 'Login';

  submit.onclick = async () => {
    error.style.display = 'none';

    try {
      if (isRegister) {
        await registerUser({
          email: emailInput.value,
          username: usernameInput.value,
          password: passwordInput.value,
          role: roleSelect.value,
          isAdult: true,
        });
      } else {
        await loginUser({
          email: emailInput.value,
          password: passwordInput.value,
        });
      }

      if (typeof onAuthenticated === 'function') {
        onAuthenticated();
      } else {
        mountAfterAuth(appElement, routeFactories);
      }
    } catch (err) {
      error.innerText = err.message || 'Authentication failed.';
      error.style.display = 'block';
    }
  };

  const switchMode = document.createElement('button');
  switchMode.className = 'button-secondary';
  switchMode.innerText = isRegister ? 'Already have an account? Login' : 'Need an account? Register';
  switchMode.onclick = () => {
    appElement.innerHTML = '';
    appElement.appendChild(createAuthScreen({
      mode: isRegister ? 'login' : 'register',
      routeFactories,
      appElement,
      onAuthenticated,
    }));
  };

  form.appendChild(error);
  form.appendChild(submit);
  form.appendChild(switchMode);

  shell.appendChild(title);
  shell.appendChild(helper);
  shell.appendChild(form);

  return shell;
}
