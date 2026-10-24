---
nib: minor
---

Toast: `createToaster` in `@nib-ui/core/toaster` (one per page; push, dismiss, at most `max`, auto-close after `duration` unless the pointer or focus is in the region, announced politely or, for errors, assertively, with an optional action such as UNDO), `useToaster` (React, Vue), `createToasterStore` (Svelte) and `toast()` from `@nib-ui/js/toaster`; `nib-toaster` / `nib-toast` in `@nib-ui/css`. The React, Vue and Svelte bridges now return `send()` for controllers that take events from code.
