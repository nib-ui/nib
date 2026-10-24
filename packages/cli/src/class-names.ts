/** One class name in a markup file and where it starts (an offset into the text). */
export interface ClassName {
  name: string;
  offset: number;
}

// Where class lists are written: class / className attributes (Vue's :class and Svelte's
// class:list included), and the helpers that build them (clsx, cn, cva, classnames, twMerge, tw``).
const ATTRIBUTE = /(?:^|[\s<])(:|v-bind:|\[)?(class(?:Name|:list)?)\]?\s*=\s*/g;
// Svelte's `class:name={on}` toggles one class, named in the directive itself.
const DIRECTIVE = /(?:^|\s)class:(?!list\b)([\w-]+)/g;
const HELPER = /(?<![\w$.])(?:clsx|cn|cva|classnames|classNames|twMerge|twJoin|tw)\s*(?=[(`])/g;
const QUOTED = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
// A sentence, not a class list: a capitalised word or one that ends a clause.
const PROSE = /(?:^|\s)[A-Z][a-z]|[a-z][.,!?](?:\s|$)/;

/** The end of a balanced `{…}` / `(…)` starting at `from`, or of the quoted string there. */
function valueEnd(text: string, from: number): number {
  const open = text[from];
  if (open === '"' || open === "'" || open === '`') {
    const close = text.indexOf(open, from + 1);
    return close < 0 ? Math.min(text.length, from + 2000) : close + 1;
  }
  const close = open === '{' ? '}' : open === '(' ? ')' : undefined;
  if (!open || !close) return from;
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close && --depth === 0) return i + 1;
  }
  return text.length;
}

/**
 * Class names in one string's text: plain words, plus the strings inside each `${…}` (a template)
 * or `{…}` (Svelte and Astro interpolation), which are read as expressions.
 */
function words(text: string, start: number, end: number, out: ClassName[]): void {
  const body = text.slice(start, end);
  if (PROSE.test(body)) return;
  let plain = body;
  for (const open of body.matchAll(/\$?\{/g)) {
    const at = start + (open.index ?? 0) + open[0].length - 1;
    const close = Math.min(valueEnd(text, at), end);
    expression(text, at + 1, close - 1, out);
    plain = plain.slice(0, at - start) + ' '.repeat(close - at) + plain.slice(close - start);
  }
  for (const word of plain.matchAll(/[^\s,$]+/g)) out.push({ name: word[0], offset: start + (word.index ?? 0) });
}

/** The class names in the strings of an expression. */
function expression(text: string, start: number, end: number, out: ClassName[]): void {
  QUOTED.lastIndex = start;
  for (let m = QUOTED.exec(text); m && m.index < end; m = QUOTED.exec(text)) {
    const close = m.index + m[0].length;
    words(text, m.index + 1, close - 1, out);
    QUOTED.lastIndex = close;
  }
}

/**
 * Every class name written in a class attribute, a Svelte class directive or a class helper's
 * strings. A bound attribute (`:class="{ 'a': on }"`) and a JSX `{…}` value are expressions: their
 * strings hold the names. Strings that read as sentences are skipped.
 */
export function classNames(text: string): ClassName[] {
  const out: ClassName[] = [];
  for (const m of text.matchAll(ATTRIBUTE)) {
    const start = (m.index ?? 0) + m[0].length;
    const end = valueEnd(text, start);
    const bound = !!m[1] || m[2] === 'class:list';
    const quoted = /["'`]/.test(text[start] ?? '');
    if (quoted && !bound) words(text, start + 1, end - 1, out);
    else expression(text, quoted ? start + 1 : start, quoted ? end - 1 : end, out);
  }
  for (const m of text.matchAll(DIRECTIVE))
    out.push({ name: m[1] ?? '', offset: (m.index ?? 0) + m[0].indexOf(':') + 1 });
  for (const m of text.matchAll(HELPER)) {
    const start = (m.index ?? 0) + m[0].length;
    expression(text, start, valueEnd(text, start), out);
  }
  return out;
}

/** Turns offsets into 1-based lines and columns, with the line starts found once. */
export function positions(text: string): (offset: number) => { line: number; column: number } {
  const starts = [0];
  for (let i = text.indexOf('\n'); i >= 0; i = text.indexOf('\n', i + 1)) starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if ((starts[mid] ?? 0) <= offset) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, column: offset - (starts[lo] ?? 0) + 1 };
  };
}
