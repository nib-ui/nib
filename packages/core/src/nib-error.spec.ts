import { describe, expect, it } from 'vitest';
import { NibError } from './index.js';

describe('NibError', () => {
  it('carries its code and prefixes the message with it', () => {
    const error = new NibError('unknown-part', 'listbox has no part "thumb"');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('NibError');
    expect(error.code).toBe('unknown-part');
    expect(error.message).toBe('[nib:unknown-part] listbox has no part "thumb"');
  });
});
