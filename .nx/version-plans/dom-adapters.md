---
nib: minor
---

`@nib-ui/dom` gains the browser side of core's seams: `runIntents()` (focus, scroll-into-view, announce; returns intents whose element is missing), `announce()` through one polite and one assertive live region per page, `toNibEvent()` (keyboard, input and composition events, IME-aware), `uniqueId()` for vanilla JS, and `domGeometry()` (element boxes, visual viewport, and a frame-batched `watch`).
