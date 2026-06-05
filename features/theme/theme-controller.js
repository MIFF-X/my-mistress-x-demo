const THEME_STORAGE_KEY = 'mistress-x-theme';
const DENSITY_STORAGE_KEY = 'mistress-x-density';

export function getStoredTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
}

export function getStoredDensity() {
  return localStorage.getItem(DENSITY_STORAGE_KEY) || 'comfortable';
}

export function applyTheme(theme = getStoredTheme()) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  return nextTheme;
}

export function applyDensity(density = getStoredDensity()) {
  const nextDensity = density === 'compact' ? 'compact' : 'comfortable';
  document.documentElement.setAttribute('data-density', nextDensity);
  localStorage.setItem(DENSITY_STORAGE_KEY, nextDensity);
  return nextDensity;
}

export function toggleTheme() {
  return applyTheme(getStoredTheme() === 'light' ? 'dark' : 'light');
}

export function toggleDensity() {
  return applyDensity(getStoredDensity() === 'compact' ? 'comfortable' : 'compact');
}

export function initThemeSystem() {
  applyTheme(getStoredTheme());
  applyDensity(getStoredDensity());
}

export function createThemeToggleButton({ label = 'Toggle theme', compact = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = compact ? 'mx-theme-toggle mx-theme-toggle--compact' : 'mx-theme-toggle';
  button.setAttribute('aria-label', label);

  const syncLabel = () => {
    const theme = getStoredTheme();
    button.textContent = theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode';
  };

  button.addEventListener('click', () => {
    toggleTheme();
    syncLabel();
  });

  syncLabel();
  return button;
}

export function createDensityToggleButton({ label = 'Toggle density' } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mx-theme-toggle mx-density-toggle';
  button.setAttribute('aria-label', label);

  const syncLabel = () => {
    const density = getStoredDensity();
    button.textContent = density === 'compact' ? '↔ Comfortable' : '↔ Compact';
  };

  button.addEventListener('click', () => {
    toggleDensity();
    syncLabel();
  });

  syncLabel();
  return button;
}

const themeStyles = document.createElement('style');
themeStyles.textContent = `
  .mx-theme-toggle {
    min-height: 2.4rem;
    padding: 0.55rem 0.8rem;
    border: 1px solid var(--mx-border);
    border-radius: var(--mx-radius-md);
    background: rgba(255,255,255,0.06);
    color: var(--mx-text);
    font-weight: 800;
    transition: transform var(--mx-transition), border-color var(--mx-transition), background var(--mx-transition);
  }

  .mx-theme-toggle:hover {
    transform: translateY(-1px);
    border-color: var(--mx-border-strong);
    background: rgba(212,175,55,0.1);
  }

  .mx-theme-toggle--compact {
    min-height: 2rem;
    padding: 0.45rem 0.65rem;
    font-size: var(--mx-text-xs);
  }
`;

document.head.appendChild(themeStyles);
