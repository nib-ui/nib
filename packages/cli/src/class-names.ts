/** One class name in a markup file and where it starts (an offset into the text). */
export interface ClassName {
  name: string;
  offset: number;
}

// Where class lists are written: class / className attributes (Vue's :class and Svelte's
// class:list included), and the helpers that build them (clsx, cn, cva, classnames, twMerge, tw``).
const ATTRIBUTE = /(?:^|[\s<])(:|v-bind:|\[)?(class(?:Name|:list)?)\]?\s*=\s*/g;
const HELPER = /(?<![\w$.])(?:clsx|cn|cva|classnames|classNames|twMerge|twJoin|tw)\s*(?=[(`])/g;

/** The end of the value that starts at `from`: a quoted string, or a balanced `{…}` / `(…)`. */
function valueEnd(text: string, from: number): number {
  const open = text[from];
  if (open === '"' || open === "'" || open === '`') {
    const close = text.indexOf(open, from + 1);
    return close < 0 ? text.length : close + 1;
  }
  const pair: Record<string, string> = { '{': '}', '(': ')' };
  const close = open ? pair[open] : undefined;
  if (!open || !close) return from;
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close && --depth === 0) return i + 1;
  }
  return text.length;
}

/** The quoted strings inside an expression; a plain quoted value is one string. */
function strings(text: string, start: number, end: number): { body: string; offset: number }[] {
  const out: { body: string; offset: number }[] = [];
  const quoted = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  quoted.lastIndex = start;
  for (let m = quoted.exec(text); m && m.index < end; m = quoted.exec(text))
    out.push({ body: m[2] ?? '', offset: m.index + 1 });
  return out;
}

/**
 * Every class name written in a class attribute or a class helper's strings. Words in an
 * expression's strings count too (`{ 'rounded-lg': open }`); `${…}` parts of a template are skipped.
 */
export function classNames(text: string): ClassName[] {
  const out: ClassName[] = [];
  // A bound attribute (`:class="{ 'a': on }"`) holds an expression: its inner strings are the names.
  const take = (start: number, bound = false) => {
    const end = valueEnd(text, start);
    const quoted = bound && /["']/.test(text[start] ?? '');
    for (const { body, offset } of strings(text, quoted ? start + 1 : start, quoted ? end - 1 : end)) {
      const plain = body.replace(/\$\{[^}]*\}/g, (m) => ' '.repeat(m.length));
      for (const word of plain.matchAll(/[^\s,]+/g)) out.push({ name: word[0], offset: offset + (word.index ?? 0) });
    }
  };
  for (const m of text.matchAll(ATTRIBUTE)) take((m.index ?? 0) + m[0].length, !!m[1] || m[2] === 'class:list');
  for (const m of text.matchAll(HELPER)) take((m.index ?? 0) + m[0].length);
  return out;
}

/** 1-based line and column of an offset. */
export function position(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset);
  const line = before.split('\n').length;
  return { line, column: offset - before.lastIndexOf('\n') };
}
