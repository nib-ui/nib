import { describe, expect, it } from 'vitest';
import { classProblem, utilityOf } from './class-rules.ts';

const rule = (name: string) => classProblem(name)?.rule ?? null;

describe('classProblem', () => {
  it('flags radius, shadow, gradient and blur utilities, under any variant', () => {
    expect(rule('rounded')).toBe('nib/no-radius');
    expect(rule('md:hover:rounded-tl-lg')).toBe('nib/no-radius');
    expect(rule('rounded-[8px]')).toBe('nib/no-radius');
    expect(rule('shadow-md')).toBe('nib/no-shadow');
    expect(rule('drop-shadow-[0_0_2px_black]')).toBe('nib/no-shadow');
    expect(rule('bg-linear-to-r')).toBe('nib/no-gradient');
    expect(rule('bg-gradient-to-b')).toBe('nib/no-gradient');
    expect(rule('!backdrop-blur-sm')).toBe('nib/no-blur');
  });

  it('lets the forms that keep the law through', () => {
    for (const name of ['rounded-none', 'rounded-[0]', 'rounded-s-none', 'shadow-none', 'blur-none', 'bg-nib-surface'])
      expect(rule(name)).toBeNull();
  });

  it("flags colours that are not Nib's tokens: palette shades, black, white and arbitrary colours", () => {
    expect(rule('bg-red-500')).toBe('nib/color-tokens');
    expect(rule('dark:text-zinc-900/50')).toBe('nib/color-tokens');
    expect(rule('border-x-white')).toBe('nib/color-tokens');
    expect(rule('text-[#ff0000]')).toBe('nib/color-tokens');
    expect(rule('bg-[oklch(60%_0.1_170)]')).toBe('nib/color-tokens');
    for (const name of ['text-nib-red', 'bg-nib-accent', 'text-sm', 'border-2', 'w-[120px]', 'p-4'])
      expect(rule(name)).toBeNull();
  });
});

describe('utilityOf', () => {
  it('drops variants, the important mark and a negative sign, but not colons in an arbitrary value', () => {
    expect(utilityOf('md:hover:-mt-2')).toBe('mt-2');
    expect(utilityOf('bg-[url(a:b)]')).toBe('bg-[url(a:b)]');
    expect(utilityOf('sm:rounded-lg!')).toBe('rounded-lg');
  });
});
