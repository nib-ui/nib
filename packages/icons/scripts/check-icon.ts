// The drawing laws of the Nib icon set (ADR 8), checked on every source SVG: a 16 or 20 box,
// <path> only, straight segments at 0°, 45° or 90°, and 1px or 2px strokes whose every point sits
// where the stroke covers whole pixels (.5 for 1px, whole numbers for 2px), with the square cap
// inside the box. Caps (square), joins (miter) and colour (currentColor) are set by the build, so
// a source may not set them. A zero-length segment is a dot: its square cap draws one pixel.

export interface IconPath {
  d: string;
  width: 1 | 2;
}

export interface CheckedIcon {
  size: number;
  paths: IconPath[];
  problems: string[];
}

const ALLOWED = new Set(['M', 'L', 'H', 'V', 'Z']);

export function checkIcon(source: string): CheckedIcon {
  const problems: string[] = [];
  const viewBox = /viewBox="([^"]+)"/.exec(source)?.[1] ?? '';
  const size = Number(viewBox.split(/\s+/)[3]);
  if (!/^0 0 (16 16|20 20)$/.test(viewBox)) problems.push(`viewBox ${viewBox} (only 16 or 20)`);

  const paths: IconPath[] = [];
  const inner = source.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '');
  for (const [, tag = '', attrs = ''] of inner.matchAll(/<([a-zA-Z]+)\b([^>]*?)\/?>/g)) {
    if (tag !== 'path') {
      problems.push(`element <${tag}> (only <path>)`);
      continue;
    }
    // Attributes in double quotes only, so nothing slips past the parser below.
    const names = [...attrs.matchAll(/([^\s=]+)\s*=\s*(["'])/g)];
    for (const [, name = '', quote] of names) {
      if (quote !== '"') problems.push(`attribute "${name}" in single quotes`);
      else if (name !== 'd' && name !== 'stroke-width') problems.push(`attribute "${name}" on <path>`);
    }
    const width = Number(/stroke-width="([^"]+)"/.exec(attrs)?.[1] ?? 1);
    if (width !== 1 && width !== 2) problems.push(`stroke-width ${width} (only 1 or 2)`);
    const d = /(?:^|\s)d="([^"]*)"/.exec(attrs)?.[1]?.trim() ?? '';
    if (!d) problems.push('<path> without a d');
    else if (!/^[Mm]/.test(d)) problems.push(`path "${d}" does not start with M`);
    else problems.push(...checkPath(d, width, size));
    paths.push({ d, width: width === 2 ? 2 : 1 });
  }
  if (!paths.length) problems.push('no <path>');
  return { size, paths, problems };
}

function checkPath(d: string, width: number, size: number): string[] {
  const problems: string[] = [];
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? [];
  // A stroke covers whole pixels when its points are on .5 (1px) or on whole pixels (2px); the
  // square cap reaches half the width past an end, so points keep that far from the edges.
  const crisp = (v: number) => (v * 2) % 1 === 0 && ((v * 2) % 2 === 0) === (width === 2);
  const [low, high] = [width / 2, size - width / 2];
  let [x, y, startX, startY] = [0, 0, 0, 0];
  let command = '';
  const at = (i: number) => Number(tokens[i]);

  const point = (nx: number, ny: number, draw: boolean) => {
    if (!crisp(nx) || !crisp(ny)) problems.push(`${width}px stroke point ${nx},${ny} straddles two pixels`);
    if (nx < low || ny < low || nx > high || ny > high) {
      problems.push(`point ${nx},${ny} puts the stroke outside the ${size}×${size} box`);
    }
    if (draw) {
      const [dx, dy] = [nx - x, ny - y];
      if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
        problems.push(`segment ${x},${y} → ${nx},${ny} is not at 0°, 45° or 90°`);
      }
    }
    [x, y] = [nx, ny];
  };

  for (let i = 0; i < tokens.length;) {
    const token = tokens[i] ?? '';
    if (/[a-zA-Z]/.test(token)) {
      command = token;
      i++;
      if (!ALLOWED.has(command.toUpperCase())) {
        problems.push(`curve or arc command "${command}" (only M L H V Z)`);
        return problems;
      }
      if (command.toUpperCase() === 'Z') {
        point(startX, startY, true);
        continue;
      }
    }
    const relative = command === command.toLowerCase();
    const [ox, oy] = relative ? [x, y] : [0, 0];
    switch (command.toUpperCase()) {
      case 'M':
        point(ox + at(i), oy + at(i + 1), false);
        [startX, startY] = [x, y];
        command = relative ? 'l' : 'L';
        i += 2;
        break;
      case 'L':
        point(ox + at(i), oy + at(i + 1), true);
        i += 2;
        break;
      case 'H':
        point(ox + at(i), y, true);
        i += 1;
        break;
      case 'V':
        point(x, oy + at(i), true);
        i += 1;
        break;
      default:
        return [...problems, `numbers after "${command}"`];
    }
  }
  return problems;
}
