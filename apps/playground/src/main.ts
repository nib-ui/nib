// The proof press page: reads the controls, applies them to the preview, and lists proof marks and
// the stylesheet to export. All the colour logic is in proof-press.ts.
import '@nib-ui/fonts/fonts.css';
import '@nib-ui/css/nib.css';
import './press.css';
import '@nib-ui/js/copy';
import { init } from '@nib-ui/js';
import tokens from '@nib-ui/tokens/tokens.json';
import { customProperties, defaults, exportCss, HUES, proofMarks, type Choices, type Hue } from './proof-press.ts';

const colors = tokens.color;
const form = document.querySelector<HTMLFormElement>('.press__controls');
const preview = document.querySelector<HTMLElement>('#preview');
const summary = document.querySelector<HTMLElement>('.press__summary');
const marks = document.querySelector<HTMLElement>('.press__marks');
const css = document.querySelector<HTMLElement>('.press__css');
const select = form?.querySelector<HTMLSelectElement>('select[name="errorHue"]');

const start = defaults(colors);
for (const hue of HUES) select?.append(new Option(hue, hue, hue === start.errorHue, hue === start.errorHue));

/** Puts the shipped values into the colour inputs (also on reset). */
function fill() {
  for (const kind of ['accent', 'accentText'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      const input = form?.elements.namedItem(`${kind}-${theme}`) as HTMLInputElement | null;
      if (input) input.value = start[kind][theme];
    }
  }
}

function read(): Choices {
  const value = (name: string) => (form?.elements.namedItem(name) as HTMLInputElement | null)?.value ?? '';
  return {
    accent: { light: value('accent-light'), dark: value('accent-dark') },
    accentText: { light: value('accentText-light'), dark: value('accentText-dark') },
    errorHue: (select?.value ?? start.errorHue) as Hue,
  };
}

function render() {
  if (!form || !preview) return;
  const choices = read();
  const data = new FormData(form);
  preview.dataset['theme'] = String(data.get('theme'));
  preview.dataset['density'] = String(data.get('density'));
  for (const [name, value] of Object.entries(customProperties(choices))) preview.style.setProperty(name, value);

  const found = proofMarks(colors, choices);
  const errors = found.filter((m) => m.severity === 'error').length;
  const warnings = found.length - errors;
  const text = [
    errors === 0 ? 'Every pair passes' : `${errors} ${errors === 1 ? 'pair fails' : 'pairs fail'}`,
    warnings ? `${warnings} ${warnings === 1 ? 'warning' : 'warnings'}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  // Only a changed sentence is written, so dragging a colour does not repeat it to screen readers.
  if (summary && summary.textContent !== text) summary.textContent = text;
  marks?.replaceChildren(
    ...found.map((m) => {
      const li = document.createElement('li');
      li.className = `press__mark press__mark--${m.severity}`;
      li.textContent = `${m.theme} · ${m.message}`;
      return li;
    }),
  );
  if (css) css.textContent = exportCss(choices);
}

fill();
form?.addEventListener('input', render);
form?.addEventListener('reset', () => setTimeout(() => (fill(), render())));
render();
init();
