/**
 * Stable codes for programmer errors. Each code has a docs entry explaining the fix, so the
 * strings are part of the public interface and never change meaning.
 */
export type NibErrorCode =
  /** An option has a value the controller cannot use, e.g. a negative slider step. */
  | 'invalid-option'
  /** `part()` was asked for a part name the controller does not have. */
  | 'unknown-part'
  /** A method other than `destroy()` was called on a destroyed instance. */
  | 'destroyed';

/**
 * Thrown for programmer errors only. Events that make no sense in the current state are
 * ignored instead, because users can always produce them (a key press on a closed menu).
 */
export class NibError extends Error {
  readonly code: NibErrorCode;

  constructor(code: NibErrorCode, message: string) {
    super(`[nib:${code}] ${message}`);
    this.name = 'NibError';
    this.code = code;
  }
}
