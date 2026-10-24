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
        else {
          // Only when it is not already so: showing an open popover throws. A disconnected or
          // non-popover element throws too; that intent is reported, the rest still run.
          try {
            if (el.matches(':popover-open') !== intent.open) {
              if (intent.open) el.showPopover();
              else el.hidePopover();
            }
          } catch {
            missing.push(intent);
          }
        }
        break;
      }
      case 'modal': {
        const el = doc.getElementById(intent.ref);
        // By name, not instanceof: a dialog in an iframe has that window's constructors.
        if (el?.localName !== 'dialog') missing.push(intent);
        else if ((el as HTMLDialogElement).open !== intent.open) {
          // A dialog that is not connected, or already open non-modally, throws on showModal().
          try {
            if (intent.open) (el as HTMLDialogElement).showModal();
            else (el as HTMLDialogElement).close();
          } catch {
            missing.push(intent);
          }
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
