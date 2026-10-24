import colorTokens from './color-tokens.ts';
import noBlur from './no-blur.ts';
import noGradient from './no-gradient.ts';
import noImportant from './no-important.ts';
import noPhysicalDirection from './no-physical-direction.ts';
import noRadius from './no-radius.ts';
import noShadow from './no-shadow.ts';

/** Every Nib law as a Stylelint plugin; pass the array to `plugins`. */
export default [noRadius, noShadow, noGradient, noBlur, noImportant, noPhysicalDirection, colorTokens];
