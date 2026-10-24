/**
 * Matches the opening of a call such as `blur(`. The call's presence is the violation, so its
 * arguments, however deeply they nest, never need matching.
 */
export const callOf = (name: string) => new RegExp(`\\b${name}\\(`, 'i');

export const isNone = (value: string) => value.trim().toLowerCase() === 'none';

/** Removes quoted strings, whose text is never a colour, length or keyword. */
export const withoutStrings = (value: string) => value.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
