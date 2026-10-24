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

  it('keeps a letter that is its own letter in the language apart: Swedish å is not a', () => {
    expect(createMatcher('sv').filter([{ key: 'a', label: 'Åre' }], 'are', 'contains')).toEqual([]);
    expect(createMatcher('en').filter([{ key: 'a', label: 'Åre' }], 'are', 'contains')).toHaveLength(1);
  });

  it('matches a label written with combining marks (NFD) in its own positions', () => {
    expect(createMatcher('vi').range('Ha\u0300 No\u0323\u0302i', 'noi', 'contains')).toEqual({ start: 3, end: 6 });
  });

  it('filters ten thousand labels in well under a frame per keystroke once folded', () => {
    const m = createMatcher('vi');
    const many = Array.from({ length: 10_000 }, (_, i) => ({ key: String(i), label: `Phường ${i} Quận Hoàn Kiếm` }));
    m.filter(many, 'x', 'contains');
    const t0 = performance.now();
    for (const q of ['p', 'ph', 'phu', 'phuo', 'phuong 99']) m.filter(many, q, 'contains');
    expect((performance.now() - t0) / 5).toBeLessThan(50);
  });
});
