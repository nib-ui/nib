// Helpers that run inside the browser under test. The main entry also holds Playwright and axe
// presets for Node, which a browser bundle cannot load.
export { mountTwice, type Mount } from './mount-twice.ts';
