import type { Intent, Part } from '@nib-ui/core';
import { domAttrs, toNibEvent } from '@nib-ui/dom';

// React spells a few attributes and every event prop its own way.
const ATTRS: Record<string, string> = {
  tabindex: 'tabIndex',
  for: 'htmlFor',
  class: 'className',
  readonly: 'readOnly',
  autocomplete: 'autoComplete',
  inputmode: 'inputMode',
  enterkeyhint: 'enterKeyHint',
  spellcheck: 'spellCheck',
  autocapitalize: 'autoCapitalize',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  contenteditable: 'contentEditable',
  accesskey: 'accessKey',
  autofocus: 'autoFocus',
  popovertarget: 'popoverTarget',
  popovertargetaction: 'popoverTargetAction',
};

/** React takes `style` as an object: "a: b; --c: d" becomes { a: 'b', '--c': 'd' }. */
function styleObject(css: string): Record<string, string> {
  const style: Record<string, string> = {};
  for (const declaration of css.split(';')) {
    const at = declaration.indexOf(':');
    if (at < 0) continue;
    const name = declaration.slice(0, at).trim();
    const camel = name.startsWith('--') ? name : name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[camel] = declaration.slice(at + 1).trim();
  }
  return style;
}

// Core parts use `input`, never `change`: React's onChange fires on every input, unlike the DOM's.
const EVENTS: Record<string, string> = {
  click: 'onClick',
  dblclick: 'onDoubleClick',
  contextmenu: 'onContextMenu',
  keydown: 'onKeyDown',
  keyup: 'onKeyUp',
  keypress: 'onKeyPress',
  input: 'onInput',
  beforeinput: 'onBeforeInput',
  change: 'onChange',
  focus: 'onFocus',
  focusin: 'onFocus',
  blur: 'onBlur',
  focusout: 'onBlur',
  pointerdown: 'onPointerDown',
  pointerup: 'onPointerUp',
  pointermove: 'onPointerMove',
  pointerenter: 'onPointerEnter',
  pointerleave: 'onPointerLeave',
  pointercancel: 'onPointerCancel',
  pointerover: 'onPointerOver',
  pointerout: 'onPointerOut',
  mouseover: 'onMouseOver',
  mouseout: 'onMouseOut',
  touchstart: 'onTouchStart',
  touchmove: 'onTouchMove',
  touchend: 'onTouchEnd',
  dragstart: 'onDragStart',
  dragover: 'onDragOver',
  drop: 'onDrop',
  dragend: 'onDragEnd',
  select: 'onSelect',
  transitionend: 'onTransitionEnd',
  animationend: 'onAnimationEnd',
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  compositionstart: 'onCompositionStart',
  compositionupdate: 'onCompositionUpdate',
  compositionend: 'onCompositionEnd',
  scroll: 'onScroll',
  wheel: 'onWheel',
  toggle: 'onToggle',
  beforetoggle: 'onBeforeToggle',
  submit: 'onSubmit',
  paste: 'onPaste',
};

/** A part as React props; handlers hand their intents to `queue`, which runs them after commit. */
export function reactProps(part: Part, queue: (intents: readonly Intent[]) => void): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(domAttrs(part.attrs))) {
    props[ATTRS[name] ?? name] = name === 'style' ? styleObject(value) : value;
  }
  for (const [type, handler] of Object.entries(part.on)) {
    // A field whose value Nib controls is a controlled React input: React wants onChange for it,
    // which it fires on every input anyway.
    const prop = type === 'input' && 'value' in part.attrs ? 'onChange' : EVENTS[type];
    if (!prop) throw new Error(`[nib] @nib-ui/react has no prop for the "${type}" event`);
    props[prop] = (event: { nativeEvent: Event }) => queue(handler(toNibEvent(event.nativeEvent)));
  }
  return props;
}
