import type { DtcgGroup, DtcgToken } from './dtcg.ts';

const ALIAS = /^\{([^}]+)\}$/;

const isToken = (node: unknown): node is DtcgToken =>
  typeof node === 'object' && node !== null && '$value' in node;

/**
 * Flattens a group to `[name, token, path]`: the name joins nested keys with `-` (for CSS), the
 * path joins them with `.` (for DTCG references).
 */
export function flatten(group: DtcgGroup, keys: string[] = []): [string, DtcgToken, string][] {
  return Object.entries(group).flatMap(([key, node]) => {
    if (key.startsWith('$') || typeof node !== 'object' || node === null) return [];
    const at = [...keys, key];
    return isToken(node) ? [[at.join('-'), node, at.join('.')]] : flatten(node, at);
  });
}

/** Child groups of a group (`density.comfortable`, `density.compact`), skipping `$` keys. */
export const subgroups = (group: DtcgGroup | undefined): [string, DtcgGroup][] =>
  Object.entries(group ?? {}).filter(
    (entry): entry is [string, DtcgGroup] =>
      !entry[0].startsWith('$') && typeof entry[1] === 'object' && entry[1] !== null,
  );

/**
 * Maps a DTCG reference path (`color.red`) to the custom property it compiles to. Every token is
 * registered before any value is written, so an alias can point anywhere in the source.
 */
export class Registry {
  readonly #vars = new Map<string, string>();

  add(path: string, cssName: string) {
    this.#vars.set(path, cssName);
  }

  /** Returns `var(--nib-…)` for an alias, or `undefined` when the value is not an alias. */
  alias(owner: string, value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const path = ALIAS.exec(value)?.[1];
    if (!path) return undefined;
    const target = this.#vars.get(path);
    if (!target) throw new Error(`"${owner}" refers to {${path}}, which does not exist`);
    return `var(${target})`;
  }
}
