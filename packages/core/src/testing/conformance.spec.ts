import { describe, expect, it } from 'vitest';
import { createTestList as createList } from './test-list.ts';
import { runConformance, type ConformanceTable } from './conformance.ts';

const items = [{ key: 'a' }, { key: 'b', disabled: true }, { key: 'c' }];

const table: ConformanceTable = {
  pattern: 'list (fixture)',
  cases: [
    {
      name: 'ArrowDown twice skips the disabled option',
      options: { id: 'l', items },
      target: { part: 'list' },
      keys: ['ArrowDown', 'ArrowDown'],
      expect: {
        attrs: [
          { part: 'list', attrs: { 'aria-activedescendant': 'l-item-c' } },
          { part: 'item', key: 'c', attrs: { 'data-current': true } },
          { part: 'item', key: 'a', attrs: { 'data-current': null } },
        ],
        intents: [
          { type: 'scroll-into-view', ref: 'l-item-a', block: 'nearest' },
          { type: 'scroll-into-view', ref: 'l-item-c', block: 'nearest' },
        ],
      },
    },
  ],
};

const create = (options: Record<string, unknown>, host: Parameters<typeof createList>[1]) =>
  createList(options as unknown as Parameters<typeof createList>[0], host);

describe('runConformance', () => {
  it('passes a case whose attributes and intents match', () => {
    expect(runConformance(table, create)).toEqual([
      { name: 'ArrowDown twice skips the disabled option', failures: [] },
    ]);
  });

  it('reports each attribute and intent that differs', () => {
    const base = table.cases[0] as ConformanceTable['cases'][number];
    const wrong: ConformanceTable = {
      pattern: 'list (fixture)',
      cases: [
        {
          ...base,
          keys: ['ArrowDown'],
          expect: {
            attrs: [{ part: 'item', key: 'c', attrs: { 'data-current': true } }],
            intents: [],
          },
        },
      ],
    };
    expect(runConformance(wrong, create)[0]?.failures).toEqual([
      'item[c] data-current: expected true, got absent',
      'intents: expected [], got [{"type":"scroll-into-view","ref":"l-item-a","block":"nearest"}]',
    ]);
  });

  it('is plain data, so the same table can drive the bindings later', () => {
    expect(JSON.parse(JSON.stringify(table))).toEqual(table);
  });

  const one = (c: Partial<ConformanceTable['cases'][number]>): ConformanceTable => ({
    pattern: 'list (fixture)',
    cases: [{ name: 'x', options: { id: 'l', items }, target: { part: 'list' }, keys: [], expect: {}, ...c }],
  });

  it('compares intents regardless of key order', () => {
    const t = one({
      keys: ['ArrowDown'],
      expect: { intents: [{ block: 'nearest', ref: 'l-item-a', type: 'scroll-into-view' } as never] },
    });
    expect(runConformance(t, create)[0]?.failures).toEqual([]);
  });

  it('compares attributes as the DOM would, so "true" equals true', () => {
    const t = one({
      keys: ['ArrowDown'],
      expect: { attrs: [{ part: 'item', key: 'a', attrs: { 'data-current': 'true' } }] },
    });
    expect(runConformance(t, create)[0]?.failures).toEqual([]);
  });

  it('records a case that throws as a failure and still runs the others', () => {
    const t: ConformanceTable = {
      pattern: 'list (fixture)',
      cases: [
        {
          name: 'bad',
          options: { id: 'l', items },
          target: { part: 'item', key: 'a' },
          keys: ['ArrowDown'],
          expect: {},
        },
        { name: 'good', options: { id: 'l', items }, target: { part: 'list' }, keys: ['End'], expect: {} },
      ],
    };
    expect(runConformance(t, create)).toEqual([
      { name: 'bad', failures: ['threw: Part l-item-a has no keydown handler'] },
      { name: 'good', failures: [] },
    ]);
  });

  it('accepts keys with modifiers and a wait before them', () => {
    const t = one({
      keys: [
        { key: 'End', shiftKey: true },
        { key: 'Home', wait: 600 },
      ],
      expect: { attrs: [{ part: 'item', key: 'a', attrs: { 'data-current': true } }] },
    });
    expect(runConformance(t, create)[0]?.failures).toEqual([]);
  });
});
