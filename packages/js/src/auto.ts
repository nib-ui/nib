// Side-effect entry: `import '@nib-ui/js/auto'` sets up every marked element once the page is parsed.
// Call init(root) yourself after rendering new markup, and destroy(root) before removing it.
// The first init waits a microtask, so components defined after this import in the same module
// graph are already registered. Importing it on the server does nothing.
import { init } from './registry.ts';

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  else queueMicrotask(() => init());
}
