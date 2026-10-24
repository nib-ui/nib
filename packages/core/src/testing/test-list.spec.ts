import { describe, expect, it } from 'vitest';
import { createTestList } from './index.ts';

describe('createTestList', () => {
  it('shows the locale it was given, so bindings can prove they pass the page language', () => {
    expect(createTestList({ items: [], locale: 'vi' }).part('list').attrs['data-locale']).toBe('vi');
    expect(createTestList({ items: [] }).part('list').attrs['data-locale']).toBeUndefined();
  });
});
