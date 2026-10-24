import { systemClock, type AttrValue, type Host } from '@nib-ui/core';
import { domGeometry } from './dom-geometry.ts';

/**
 * Part attributes as the DOM stores them: `undefined` means absent, anything else is its string,
 * so `false` stays `"false"` (as `aria-selected` needs). Every binding renders through this rule,
 * so controllers leave HTML boolean attributes (`hidden`, `disabled`, `inert`) undefined when off.
 */
export function domAttrs(attrs: Readonly<Record<string, AttrValue>>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(attrs)) if (value !== undefined) out[name] = String(value);
  return out;
}

/** The language that applies to `el`: its nearest `lang`, else `<html lang>`; undefined if unset. */
export function documentLocale(el?: Element | null, doc: Document = document): string | undefined {
  const lang = el?.closest('[lang]')?.getAttribute('lang') ?? doc.documentElement.getAttribute('lang');
  return lang || undefined;
}

/** The real clock and the document's geometry, for controllers on the client. */
export function domHost(doc: Document = document): Host {
  return { clock: systemClock, geometry: domGeometry(doc) };
}
