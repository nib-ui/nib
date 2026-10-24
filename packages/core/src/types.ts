/**
 * A side effect a controller asks for and never performs. Bindings run intents after their
 * framework has committed the render, so the element a `focus` names already exists.
 * `ref` is an element id taken from `part().attrs.id`.
 */
export type Intent =
  | { type: 'focus'; ref: string }
  | { type: 'announce'; text: string; politeness: 'polite' | 'assertive' }
  | { type: 'scroll-into-view'; ref: string; block: 'nearest' | 'center' }
  /** Shows or hides a native popover (`showPopover()` / `hidePopover()`); see ADR 12, amendment 1. */
  | { type: 'popover'; ref: string; open: boolean }
  /** Opens a native <dialog> as modal (`showModal()`) or closes it; see ADR 12, amendment 2. */
  | { type: 'modal'; ref: string; open: boolean };

/** The structural shape of a DOM event that core reads; bindings build it, core never sees a node. */
export interface NibEvent {
  type: string;
  key?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  /** True between compositionstart and compositionend (IME input such as Telex). */
  isComposing?: boolean;
  /** Text of an input or composition event. */
  data?: string;
  /** Input and composition events: the field's whole value after the change. */
  value?: string;
  /** The state a popover or details element moves to, on `toggle` and `beforetoggle`. */
  newState?: 'open' | 'closed';
  /** Pointer events: the kind of pointer, so hover-only behaviour can skip touch. */
  pointerType?: string;
  /** Focus events: whether the browser shows a focus ring (keyboard focus, not a click). */
  focusVisible?: boolean;
  /** Core calls it when it handled the event, e.g. an arrow key it moved on. */
  preventDefault(): void;
}

export type AttrValue = string | number | boolean | undefined;

/** Everything one element needs: attributes (undefined means absent) and event handlers. */
export interface Part {
  attrs: Readonly<Record<string, AttrValue>>;
  /** Handlers by DOM event type; each returns the intents the binding must run after render. */
  on: Readonly<Record<string, (event: NibEvent) => readonly Intent[]>>;
}
