import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const baseline = JSON.parse(readFileSync(new URL('../migration/upstream-sha256.json', import.meta.url), 'utf8'));
const allowed = new Set(['astro.config.mjs', 'package.json', 'package-lock.json', 'tsconfig.json', 'src/user.config.mjs', '.github/workflows/deploy.yml']);
const changed = [], errors = [];
let unchanged = 0;
for (const [name, digest] of Object.entries(baseline)) {
  const path = new URL('../' + name, import.meta.url);
  if (!existsSync(path)) { errors.push(`${name}: missing`); continue; }
  const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (actual === digest) unchanged++;
  else if (allowed.has(name)) changed.push(name);
  else errors.push(`${name}: unexpectedly modified`);
}
console.log(`${unchanged} upstream files byte-identical; ${changed.length} permitted configuration/dependency changes.`);
for (const name of changed) console.log(`CONFIG: ${name}`);
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else console.log('OK: original sCMS components, layouts, styles, routes and utilities are intact.');
