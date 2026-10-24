import type { Intent } from '@nib-ui/core';
import { announce, type AnnounceOptions } from './live-region.ts';

export type RunIntentsOptions = AnnounceOptions;

/**
 * Performs the intents a controller returned, in order. Call it after the framework committed the
 * render, so the elements they name exist. Returns the intents whose element was not found: a
 * non-empty result means the binding ran them too early.
 */
export function runIntents(intents: readonly Intent[], options: RunIntentsOptions = {}): Intent[] {
  const doc = options.document ?? document;
  const missing: Intent[] = [];
  for (const intent of intents) {
    switch (intent.type) {
      case 'announce':
        announce(intent.text, intent.politeness, options);
        break;
      case 'popover': {
        const el = doc.getElementById(intent.ref);
        if (!el) missing.push(intent);
        // Only when it is not already so: showing an open popover throws.
        else if (el.matches(':popover-open') !== intent.open) {
          if (intent.open) el.showPopover();
          else el.hidePopover();
        }
        break;
      }
      case 'focus':
      case 'scroll-into-view': {
        const el = doc.getElementById(intent.ref);
        if (!el) missing.push(intent);
        else if (intent.type === 'focus') el.focus();
        else el.scrollIntoView({ block: intent.block, inline: 'nearest' });
        break;
      }
      default:
        intent satisfies never;
    }
  }
  return missing;
}
