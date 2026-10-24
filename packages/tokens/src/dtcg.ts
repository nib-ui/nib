/**
 * The subset of the Design Tokens Community Group format (2025.10) Nib uses. Nib extends the
 * `dimension` units with `ch` (reading width).
 */
export interface DtcgColorValue {
  colorSpace: string;
  components: (number | 'none')[];
  alpha?: number;
  /** Six-digit sRGB hex; Nib always writes it so outputs never convert colour spaces. */
  hex: string;
}

export interface DtcgToken<T = unknown> {
  $type?: string;
  $value: T;
  $description?: string;
}

export interface DtcgGroup {
  [name: string]: DtcgToken | DtcgGroup | string | undefined;
}
