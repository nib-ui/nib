import type { NibEvent } from '@nib-ui/core';

const IME_KEY_CODE = 229;

// Read by shape, not instanceof: an event from an iframe has that window's constructors.
type AnyEvent = Event &
  Partial<Omit<KeyboardEvent, keyof Event>> & { data?: string | null; newState?: string; pointerType?: string };

/**
 * The structural copy of a DOM event that core reads. `preventDefault` reaches the real event.
 * Known trade-off: Android virtual keyboards send keyCode 229 for ordinary keys too, so those
 * count as composing; their Enter, Backspace and arrows carry real key codes.
 * `currentTarget` is the element the handler is on, for frameworks that delegate events (React's
 * native event has the root as its currentTarget).
 */
export function toNibEvent(
  event: Event,
  currentTarget: Element | null = event.currentTarget as Element | null,
): NibEvent {
  const e = event as AnyEvent;
  const nib: NibEvent = { type: e.type, preventDefault: () => e.preventDefault() };
  // The field's value, for input and composition events on a text field.
  const field = e.target as { value?: unknown } | null;
  const readsValue = e.type === 'input' || e.type === 'beforeinput' || e.type.startsWith('composition');
  if (readsValue && field && typeof field.value === 'string') nib.value = field.value;
  if (typeof e.key === 'string') {
    nib.key = e.key;
    nib.shiftKey = !!e.shiftKey;
    nib.ctrlKey = !!e.ctrlKey;
    nib.metaKey = !!e.metaKey;
    nib.altKey = !!e.altKey;
    const target = e.target as Element | null;
    nib.inField = !!target?.matches?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
    // Safari fires the keydown that ends a composition with isComposing false but keyCode 229.
    nib.isComposing = !!e.isComposing || e.keyCode === IME_KEY_CODE;
  } else if (e.type.startsWith('composition')) {
    nib.data = e.data ?? '';
    nib.isComposing = e.type !== 'compositionend';
  } else if (typeof e.pointerType === 'string') {
    const p = e as unknown as PointerEvent;
    nib.pointerType = e.pointerType;
    nib.clientX = p.clientX;
    nib.capturePointer = () => currentTarget?.setPointerCapture?.(p.pointerId);
  } else if (e.type === 'scroll') {
    nib.scrollTop = currentTarget?.scrollTop ?? 0;
    nib.clientHeight = currentTarget?.clientHeight ?? 0;
  } else if (e.type === 'focus' || e.type === 'focusin') {
    const target = e.target as Element | null;
    if (target && 'matches' in target) nib.focusVisible = target.matches(':focus-visible');
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
