import type { NibEvent } from '@nib-ui/core';

const IME_KEY_CODE = 229;

// Read by shape, not instanceof: an event from an iframe has that window's constructors.
type AnyEvent = Event & Partial<Omit<KeyboardEvent, keyof Event>> & { data?: string | null; newState?: string };

/**
 * The structural copy of a DOM event that core reads. `preventDefault` reaches the real event.
 * Known trade-off: Android virtual keyboards send keyCode 229 for ordinary keys too, so those
 * count as composing; their Enter, Backspace and arrows carry real key codes.
 */
export function toNibEvent(event: Event): NibEvent {
  const e = event as AnyEvent;
  const nib: NibEvent = { type: e.type, preventDefault: () => e.preventDefault() };
  if (typeof e.key === 'string') {
    nib.key = e.key;
    nib.shiftKey = !!e.shiftKey;
    nib.ctrlKey = !!e.ctrlKey;
    nib.metaKey = !!e.metaKey;
    nib.altKey = !!e.altKey;
    // Safari fires the keydown that ends a composition with isComposing false but keyCode 229.
    nib.isComposing = !!e.isComposing || e.keyCode === IME_KEY_CODE;
  } else if (e.type.startsWith('composition')) {
    nib.data = e.data ?? '';
    nib.isComposing = e.type !== 'compositionend';
  } else if (e.newState === 'open' || e.newState === 'closed') {
    // ToggleEvent: a popover or details opening or closing.
    nib.newState = e.newState;
  } else if ('isComposing' in e) {
    // InputEvent: beforeinput and input.
    if (typeof e.data === 'string') nib.data = e.data;
    nib.isComposing = !!e.isComposing;
  }
  return nib;
}
