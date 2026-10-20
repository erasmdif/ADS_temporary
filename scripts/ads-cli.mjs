// Run the original sCMS authoring CLI against ADS's separate source directory.
// No package file is patched: a temporary project root exposes ADS as its src.
import { mkdtempSync, mkdirSync, readdirSync, symlinkSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const action = process.argv[2];
if (!['add-content', 'add-collection', 'optimize-images'].includes(action)) {
  throw new Error('Unknown ADS authoring command.');
}
const root = process.cwd();
const temp = mkdtempSync(join(tmpdir(), 'ads-scms-cli-'));
try {
  const source = resolve(root, 'src/ads');
  mkdirSync(join(temp, 'src'));
  for (const item of readdirSync(source, { withFileTypes: true })) {
    if (item.name === 'content.config.ts') continue;
    symlinkSync(join(source, item.name), join(temp, 'src', item.name), item.isDirectory() ? 'dir' : 'file');
  }
  const configFile = join(temp, 'src/content.config.ts');
  writeFileSync(configFile, readFileSync(join(source, 'content.config.ts'), 'utf8').replace(/(['"])\.\/src\/ads\/content\//g, '$1./src/content/'));
  const result = spawnSync(process.execPath, [resolve(root, `node_modules/@lad-sapienza/scms-core/bin/${action}.mjs`), ...process.argv.slice(3)], { cwd: temp, stdio: 'inherit' });
  // Generated collection loaders must refer to the real build root.
  if (action === 'add-collection') {
    const file = resolve(root, 'src/ads/content.config.ts');
    const generatedConfig = readFileSync(configFile, 'utf8');
    writeFileSync(file, generatedConfig.replace(/(['"])\.\/src\/content\//g, '$1./src/ads/content/'));
  }
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(temp, { recursive: true, force: true });
}
