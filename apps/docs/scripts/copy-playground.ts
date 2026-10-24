// The playground is its own app (built first: an implicit dependency of docs); the docs site serves
// its build under /play/.
import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../../playground/dist/', import.meta.url));
cpSync(from, fileURLToPath(new URL('../dist/play/', import.meta.url)), { recursive: true });
