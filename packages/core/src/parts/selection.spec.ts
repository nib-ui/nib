import { describe, expect, it, vi } from 'vitest';
import { createSelection } from './selection.ts';

describe('createSelection', () => {
  it('commits a choice itself when uncontrolled, then reports it', () => {
    const onValueChange = vi.fn();
    const s = createSelection({ defaultValue: 'a', onValueChange });
    expect(s.value).toBe('a');
    expect(s.choose('b')).toBe(true);
    expect(s.value).toBe('b');
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('only proposes a choice when controlled, until the caller passes the new value back', () => {
    const onValueChange = vi.fn();
    const s = createSelection({ value: 'a', onValueChange });
    expect(s.choose('b')).toBe(true);
    expect(s.value).toBe('a');
    expect(onValueChange).toHaveBeenCalledWith('b');
    s.sync({ value: 'b', onValueChange });
    expect(s.value).toBe('b');
  });

  it('treats value: null as controlled with nothing chosen', () => {
    const s = createSelection({ value: null });
    s.choose('b');
    expect(s.value).toBeNull();
  });

  it('ignores choosing the value already chosen', () => {
    const onValueChange = vi.fn();
    const s = createSelection({ defaultValue: 'a', onValueChange });
    expect(s.choose('a')).toBe(false);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('starts with nothing chosen when given neither value nor defaultValue', () => {
    expect(createSelection({}).value).toBeNull();
  });

  it('keeps the last controlled value when the caller stops controlling it', () => {
    const s = createSelection({ defaultValue: 'a' });
    s.choose('b');
    s.sync({ value: 'z' });
    s.sync({});
    expect(s.value).toBe('z');
  });
});
