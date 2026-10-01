import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npmCLI = process.env.npm_execpath || resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
function run(args, cwd = root) {
  const result = spawnSync(process.execPath, [npmCLI, ...args], { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'npm command failed');
  return result.stdout;
}
const artifacts = join(root, 'artifacts');
mkdirSync(artifacts, { recursive: true });
const [pack] = JSON.parse(run(['pack', '--json', '--pack-destination', artifacts]));
const files = pack.files.map(file => file.path);
assert.ok(files.includes('LICENSE') && files.includes('README.md') && files.includes('src/index.d.ts'));
assert.ok(files.every(path => /^(src\/|bin\/|examples\/|README\.md$|LICENSE$|CHANGELOG\.md$|package\.json$)/.test(path)), 'Only intentional public package files');
const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
assert.equal(pack.version, metadata.version);
assert.equal(metadata.homepage, 'https://jackpotcalculator.com/lottery-annuity-calculator/');
const sandbox = mkdtempSync(join(tmpdir(), 'jackpot-annuity-install-'));
writeFileSync(join(sandbox, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
run(['install', '--ignore-scripts', '--no-audit', '--no-fund', join(artifacts, pack.filename)], sandbox);
const check = spawnSync(process.execPath, ['--input-type=module', '-e', `
  import assert from 'node:assert/strict';
  import { calculateAnnuity, toCSV } from 'jackpot-annuity';
  const result = calculateAnnuity({total:'1000.01', payments:3, growthRate:0, discountRate:0});
  assert.equal(result.presentValueCents, 100001);
  assert.equal(result.rows.reduce((sum,r)=>sum+r.amountCents,0),100001);
  assert.ok(toCSV(result).includes('333.34'));
`], { cwd: sandbox, encoding: 'utf8' });
assert.equal(check.status, 0, check.stderr);
const cli = spawnSync(process.execPath, [join(sandbox, 'node_modules/jackpot-annuity/bin/jackpot-annuity.js'), '1M', '--format', 'json'], { cwd: sandbox, encoding: 'utf8' });
assert.equal(cli.status, 0, cli.stderr);
assert.equal(JSON.parse(cli.stdout).rows.length, 30);
writeFileSync(join(artifacts, 'package-verification.json'), JSON.stringify({ name: pack.name, version: pack.version, filename: pack.filename, shasum: pack.shasum, integrity: pack.integrity, files, installedImport: 'passed', installedCLI: 'passed' }, null, 2) + '\n');
console.log(`Packed and installed ${pack.name}@${pack.version}; API and CLI passed (${files.length} public files).`);
