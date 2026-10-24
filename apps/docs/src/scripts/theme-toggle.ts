// The [T]DARK / [T]LIGHT word toggle. With no stored choice the page follows prefers-color-scheme;
// a click or Alt+T stores the opposite of what is showing. The stored choice is applied by an inline
// script in <head> before first paint, and CSS picks the word, so nothing here renders.
// The hotkey needs Alt: a bare letter (WCAG 2.1.4) would fire on speech input and on screen
// reader browse-mode keys such as T for "next table".
const KEY = 'nib-theme';
const root = document.documentElement;
const dark = matchMedia('(prefers-color-scheme: dark)');

function toggle() {
  const showing = root.dataset['theme'] ?? (dark.matches ? 'dark' : 'light');
  const next = showing === 'dark' ? 'light' : 'dark';
  root.dataset['theme'] = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Storage can be blocked; the choice then lasts for this page only.
  }
}

for (const button of document.querySelectorAll('[data-theme-toggle]')) button.addEventListener('click', toggle);
document.addEventListener('keydown', (event) => {
  // event.code, not key: on macOS Alt+T types "†".
  if (event.code !== 'KeyT' || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.repeat || event.defaultPrevented || event.isComposing) return;
  event.preventDefault();
  toggle();
});

// A module, so its names stay its own.
export {};
