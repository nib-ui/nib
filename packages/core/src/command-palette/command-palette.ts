import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { move, type Key } from '../parts/navigation.ts';
import { createLookup } from '../combobox/combobox-list.ts';
import { createMatcher, type Matchable } from '../combobox/match.ts';
import type { Intent, Part } from '../types.ts';
import { renderPaletteInput, type CommandPaletteEvent } from './command-palette-input.ts';
import { ariaShortcut } from './shortcut.ts';

export interface Command extends Matchable {
  /** Its own printed hotkey, written like the palette's `shortcut` (`mod+s`); shown, never bound here. */
  hotkey?: string;
}

export interface CommandPaletteOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag for matching; bindings default it to the page's `lang`. */
  locale?: string;
  commands: readonly Command[];
  /** Called with the command's key as the palette closes. */
  onRun?: (key: Key) => void;
  onOpenChange?: (open: boolean) => void;
  /** The keys that open it from anywhere on the page; `mod` is ⌘ on Apple platforms, Ctrl elsewhere. */
  shortcut?: string;
  /** Whether `mod` means ⌘; bindings read it from the platform. */
  apple?: boolean;
  /** The dialog's and the field's name, in the page's language. */
  label?: string;
  /** Announced when nothing matches, in the page's language. */
  emptyText?: string;
}

export interface CommandPaletteState {
  open: boolean;
  query: string;
  /** The keys of the commands that match, in order. */
  visible: readonly Key[];
  /** The command under the keyboard or pointer: the accent rule. There is no chosen value. */
  current: Key | null;
  composing: boolean;
}

export type CommandPalettePart = 'trigger' | 'dialog' | 'input' | 'listbox' | 'option';

/**
 * A command palette: a modal native <dialog> holding a combobox whose list is always shown.
 * Typing filters the commands (ignoring case and diacritics in the page's language), Up and Down
 * move the current one, Enter or a click runs it and closes the palette. The binding opens it on
 * `shortcut` (⌘K) from anywhere; Escape and focus return are the dialog's own.
 */
export function createCommandPalette(
  options: CommandPaletteOptions,
  host: Host = nullHost,
): Instance<CommandPaletteState, CommandPaletteEvent, CommandPalettePart, CommandPaletteOptions> {
  const matcher = createMatcher(options.locale ?? 'en-US');
  // What was last asked of the dialog, until its async toggle event confirms it: a second
  // shortcut press right after a run must open the palette again, not close it.
  let asked: boolean | null = null;
  const modal = (ref: string, open: boolean): Intent => ((asked = open), { type: 'modal', ref, open });
  const lookup = createLookup();
  const ids = (id: string) => ({
    trigger: `${id}-trigger`,
    dialog: `${id}-dialog`,
    input: `${id}-input`,
    listbox: `${id}-listbox`,
    option: `${id}-option`,
  });
  const all = (o: CommandPaletteOptions) => o.commands.map((c) => c.key);
  const enabled = (o: CommandPaletteOptions, visible: readonly Key[]) =>
    visible.map((k) => lookup.item(o.commands, k)!);
  const first = (o: CommandPaletteOptions, visible: readonly Key[]) => move(enabled(o, visible), null, 'first');
  const scroll = (id: string, key: Key | null): Intent[] =>
    key === null ? [] : [{ type: 'scroll-into-view', ref: `${ids(id).option}-${key}`, block: 'nearest' }];

  const fresh = (o: CommandPaletteOptions): CommandPaletteState => ({
    open: false,
    query: '',
    visible: all(o),
    current: first(o, all(o)),
    composing: false,
  });

  // New text: filter, and the first match becomes current so Enter runs it.
  const typed = (state: CommandPaletteState, o: CommandPaletteOptions, id: string, query: string) => {
    const visible = matcher.filter(o.commands, query, 'contains').map((c) => c.key);
    const current = first(o, visible);
    const intents: Intent[] =
      visible.length === 0 && state.visible.length > 0
        ? [{ type: 'announce', text: o.emptyText ?? 'No matching commands', politeness: 'polite' }]
        : [];
    return {
      state: { ...state, query, visible, current, composing: false },
      intents: [...intents, ...scroll(id, current)],
    };
  };

  return createInstance<CommandPaletteState, CommandPaletteEvent, CommandPalettePart, CommandPaletteOptions>(
    {
      name: 'command-palette',
      parts: ['trigger', 'dialog', 'input', 'listbox', 'option'],
      init: ({ options: o }) => fresh(o),
      sync: ({ state, options: o }) => {
        if (state.composing) return state;
        const visible = matcher.filter(o.commands, state.query, 'contains').map((c) => c.key);
        if (visible.join() === state.visible.join()) return state;
        const current =
          state.current !== null && lookup.isShown(visible, state.current) ? state.current : first(o, visible);
        return { ...state, visible, current };
      },
      reduce: ({ state, options: o, id }, event) => {
        const own = ids(id);
        switch (event.type) {
          case 'shortcut':
          case 'open':
          case 'close': {
            // `open` follows the dialog's toggle, however it opened (this, the trigger, the page).
            const open = asked ?? state.open;
            const want = event.type === 'shortcut' ? !open : event.type === 'open';
            if (want === open) return { state };
            if (!want) return { state, intents: [modal(own.dialog, false)] };
            // Opening starts afresh here too: a close and an open within one task coalesce into a
            // single toggle event, so the closing one may never come.
            return {
              state: { ...fresh(o), open: state.open },
              intents: [modal(own.dialog, true), { type: 'focus', ref: own.input }],
            };
          }
          case 'toggled': {
            asked = null;
            if (event.open === state.open) return { state };
            o.onOpenChange?.(event.open);
            if (event.open) return { state: { ...state, open: true } };
            // Closed however it happened (Escape, a run, the page): the next opening starts afresh.
            return { state: fresh(o) };
          }
          case 'compose':
            if (event.on) return { state: { ...state, composing: true } };
            return typed(state, o, id, event.value ?? state.query);
          case 'input':
            if (event.composing) return { state: { ...state, query: event.value, composing: true } };
            if (event.value === state.query) return { state };
            return typed(state, o, id, event.value);
          case 'move': {
            const current = move(enabled(o, state.visible), state.current, event.to, { loop: true });
            return { state: current === state.current ? state : { ...state, current }, intents: scroll(id, current) };
          }
          case 'go':
            return { state: state.current === event.key ? state : { ...state, current: event.key } };
          case 'run': {
            const command = lookup.item(o.commands, event.key ?? state.current);
            if (!command || command.disabled) return { state };
            // Closed first: a command that opens another dialog finds this one gone.
            const intents: Intent[] = [modal(own.dialog, false)];
            o.onRun?.(command.key);
            return { state, intents };
          }
        }
      },
      render: ({ state, options: o, id }, name, key = '', send): Part => {
        const own = ids(id);
        const label = o.label ?? 'Commands';
        switch (name) {
          case 'trigger':
            return {
              attrs: {
                id: own.trigger,
                commandfor: own.dialog,
                command: 'show-modal',
                'aria-haspopup': 'dialog',
                'aria-expanded': state.open,
                'aria-keyshortcuts': ariaShortcut(o.shortcut ?? 'mod+k', !!o.apple),
              },
              on: {},
            };
          case 'dialog':
            return {
              attrs: { id: own.dialog, 'aria-label': label },
              on: { toggle: (e) => (e.newState ? send({ type: 'toggled', open: e.newState === 'open' }) : []) },
            };
          case 'input':
            return renderPaletteInput(state, own, label, send);
          case 'listbox':
            return { attrs: { id: own.listbox, role: 'listbox', 'aria-label': label }, on: {} };
          default: {
            const disabled = lookup.item(o.commands, key)?.disabled;
            return {
              attrs: {
                id: `${own.option}-${key}`,
                role: 'option',
                'aria-disabled': disabled || undefined,
                'data-current': state.current === key || undefined,
                hidden: lookup.isShown(state.visible, key) ? undefined : true,
              },
              on: {
                click: () => send({ type: 'run', key }),
                pointermove: () => (disabled ? [] : send({ type: 'go', key })),
              },
            };
          }
        }
      },
    },
    options,
    host,
  );
}
