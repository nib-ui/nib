import { commandPaletteApg } from '@nib-ui/core/command-palette/apg';
import type { CommandPaletteOptions } from '@nib-ui/core/command-palette';
import { useCommandPalette } from '@nib-ui/react/command-palette';
import { useState } from 'react';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(commandPaletteApg) as unknown as CommandPaletteOptions;

export default function CommandPaletteReact() {
  const [ran, setRan] = useState('none');
  const palette = useCommandPalette({ ...options, onRun: setRan });
  return (
    <>
      <button type="button" className="nib-button" {...palette.part('trigger')}>
        <kbd className="nib-hotkey">{palette.shortcut}</kbd> Commands
      </button>
      <p>Ran: {ran}</p>
      <dialog className="nib-palette" {...palette.part('dialog')}>
        <div className="nib-palette__field">
          <input className="nib-palette__input" {...palette.part('input')} />
        </div>
        <ul className="nib-listbox nib-palette__list" {...palette.part('listbox')}>
          {options.commands.map((c) => (
            <li key={c.key} className="nib-listbox__option" {...palette.part('option', c.key)}>
              {c.label} {c.hotkey && <kbd className="nib-hotkey">{palette.print(c.hotkey)}</kbd>}
            </li>
          ))}
        </ul>
        <p className="nib-palette__empty" hidden={palette.state.visible.length > 0}>
          No matching commands
        </p>
      </dialog>
    </>
  );
}
