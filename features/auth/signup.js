import { createAuthScreen } from "./auth-screen.js";

export function createSignupScreen({ routeFactories = {} } = {}) {
  return createAuthScreen({ mode: "register", routeFactories });
}

export function mountSignupScreen({
  appElement = document.getElementById("app"),
  routeFactories = {},
} = {}) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = "";
  appElement.appendChild(createSignupScreen({ routeFactories }));

  return {
    id: "signup-screen",
    label: "Signup Screen",
    role: null,
  };
}

export const createSignupForm = createSignupScreen;
