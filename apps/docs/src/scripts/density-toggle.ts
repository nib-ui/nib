// The COMPACT / COMFORTABLE word toggle: stores the density that is not showing and sets it on the
// root. The stored choice is applied by an inline script in <head> before first paint.
const KEY = 'nib-density';
const root = document.documentElement;

function toggle() {
  const next = root.dataset['density'] === 'compact' ? 'comfortable' : 'compact';
  root.dataset['density'] = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Storage can be blocked; the choice then lasts for this page only.
  }
}

for (const button of document.querySelectorAll('[data-density-toggle]')) button.addEventListener('click', toggle);

// A module, so its names stay its own.
export {};
