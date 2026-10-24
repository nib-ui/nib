import { describe, expect, it } from 'vitest';
import { createMatcher } from './match.ts';

const ITEMS = [
  { key: 'hn', label: 'Hà Nội' },
  { key: 'hcm', label: 'Thành phố Hồ Chí Minh' },
  { key: 'dn', label: 'Đà Nẵng' },
];

describe('createMatcher', () => {
  it('matches ignoring case and diacritics, in the label positions', () => {
    const m = createMatcher('vi');
    expect(m.range('Thành phố Hồ Chí Minh', 'ho chi', 'contains')).toEqual({ start: 10, end: 16 });
    expect(m.filter(ITEMS, 'HA NOI', 'contains').map((i) => i.key)).toEqual(['hn']);
  });

  it('matches only at the start in startsWith mode, and keeps everything for an empty query or none', () => {
    const m = createMatcher('vi');
    expect(m.filter(ITEMS, 'noi', 'startsWith')).toEqual([]);
    expect(m.filter(ITEMS, 'ha', 'startsWith').map((i) => i.key)).toEqual(['hn']);
    expect(m.filter(ITEMS, ' ', 'contains')).toHaveLength(3);
    expect(m.filter(ITEMS, 'zzz', 'none')).toHaveLength(3);
  });

  it('matches Đ as D the way Vietnamese search does', () => {
    expect(
      createMatcher('vi')
        .filter(ITEMS, 'da nang', 'contains')
        .map((i) => i.key),
    ).toEqual(['dn']);
  });
});
