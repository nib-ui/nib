# @nib-ui/dom

The browser side of Nib's headless core, shared by every binding: `toNibEvent` (DOM events to the
structural events controllers read), `runIntents` (focus, live-region announcements, scrolling,
popovers and modal dialogs), `domHost` (timers and element geometry), `domAttrs` and
`listenShortcut`. Apps do not need it directly.
