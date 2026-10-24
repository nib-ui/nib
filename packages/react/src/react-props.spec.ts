import { describe, expect, it } from 'vitest';
import { reactProps } from './react-props.ts';

describe('reactProps', () => {
  it('turns a style string into the object React takes, custom properties included', () => {
    const props = reactProps(
      { attrs: { style: '--nib-x: 10px; max-block-size: 20px', popovertarget: 'p' }, on: {} },
      () => undefined,
    );
    expect(props['style']).toEqual({ '--nib-x': '10px', maxBlockSize: '20px' });
    expect(props['popoverTarget']).toBe('p');
  });
});
