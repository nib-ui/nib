// The [T]DARK / [T]LIGHT word toggle. With no stored choice the page follows prefers-color-scheme;
// a click or the T key stores the opposite of what is showing. The stored choice is applied by an
// inline script in <head> before first paint, so the page never flashes the other theme.
const KEY = 'nib-theme';
const root = document.documentElement;
const dark = matchMedia('(prefers-color-scheme: dark)');

const showing = () => (root.dataset['theme'] ?? (dark.matches ? 'dark' : 'light')) as 'dark' | 'light';

function render() {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    const next = showing() === 'dark' ? 'light' : 'dark';
    const word = button.querySelector('[data-theme-word]');
    if (word) word.textContent = button.dataset[next === 'dark' ? 'dark' : 'light'] ?? next.toUpperCase();
  }
}

function toggle() {
  const next = showing() === 'dark' ? 'light' : 'dark';
  root.dataset['theme'] = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Storage can be blocked; the choice then lasts for this page only.
  }
  render();
}

for (const button of document.querySelectorAll('[data-theme-toggle]')) button.addEventListener('click', toggle);
document.addEventListener('keydown', (event) => {
  if (event.key !== 't' || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
  const target = event.target as HTMLElement;
  if (target.closest('input, textarea, select, [contenteditable]')) return;
  toggle();
});
dark.addEventListener('change', render);
render();
