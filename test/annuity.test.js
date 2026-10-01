import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { annuitySchedule, calculateAnnuity, presentValue, parseAmount, toCSV } from '../src/index.js';

test('known 30-payment example agrees with the independent geometric formula', () => {
  const total = 100_000_000_000;
  const rows = annuitySchedule(total);
  const first = total * 0.05 / (1.05 ** 30 - 1);
  assert.ok(Math.abs(rows[0] - first) <= 1);
  assert.ok(Math.abs(rows[1] - first * 1.05) <= 1);
  assert.equal(rows.reduce((a, b) => a + b, 0), total);
});

test('equal payments and single payments handle zero growth', () => {
  assert.deepEqual(annuitySchedule(100000, 4, 0), [25000, 25000, 25000, 25000]);
  assert.deepEqual(annuitySchedule(1, 1, 0.05), [1]);
  assert.deepEqual(annuitySchedule(0), Array(30).fill(0));
});

test('rounding never creates negative payments and preserves every cent', () => {
  for (const total of [0, 1, 2, 15, 101, 100001, Number.MAX_SAFE_INTEGER]) {
    for (const growth of [-0.99, -0.5, 0, 1e-12, 0.05, 1]) {
      for (const payments of [1, 3, 30, 1000]) {
        const amounts = annuitySchedule(total, payments, growth);
        assert.ok(amounts.every(value => Number.isSafeInteger(value) && value >= 0));
        assert.equal(amounts.reduce((a, b) => a + b, 0), total);
      }
    }
  }
});

test('due and ordinary present values match a hand-computed two-period example', () => {
  assert.equal(presentValue([10000, 11000], 0.1, 'due'), 20000);
  assert.equal(presentValue([10000, 11000], 0.1, 'ordinary'), 18182);
  assert.equal(presentValue([10000, 11000], 0), 21000);
  assert.equal(presentValue([6300, 6930], 0.1), 12600, 'caller-supplied net cash flows');
});

test('payment timing is reflected in exported years', () => {
  assert.deepEqual(calculateAnnuity({ total: 100, payments: 2 }).rows.map(r => r.year), [0, 1]);
  assert.deepEqual(calculateAnnuity({ total: 100, payments: 2, timing: 'ordinary' }).rows.map(r => r.year), [1, 2]);
});

test('decimal input and suffixes preserve exact cents', () => {
  for (const [input, cents] of [['$1,234.56', 123456], ['1.234M', 123400000], ['1.2B', 120000000000], ['1.01k', 101000], [0.29, 29], ['90071992547409.91', Number.MAX_SAFE_INTEGER]]) {
    assert.equal(parseAmount(input), cents);
  }
  for (const invalid of ['', '1,00', '1,2,3', '1.001', '-1', NaN, Infinity, '90071992547409.92', true, '1e3']) assert.throws(() => parseAmount(invalid));
});

test('invalid rates, counts, timings and unsafe sums are rejected', () => {
  for (const args of [[-1], [0.5], [100, 0], [100, 1.5], [100, 1001], [100, 30, -1], [100, 30, NaN], [100, 30, 1.01]]) assert.throws(() => annuitySchedule(...args));
  for (const args of [[[]], [[1], -0.01], [[1], Infinity], [[1], 0, 'later'], [[Number.MAX_SAFE_INTEGER, 1]], [[-1]]]) assert.throws(() => presentValue(...args));
});

test('CSV decimal values sum to total cents and have a stable schema', () => {
  const result = calculateAnnuity({ total: '1000.01', payments: 3, growthRate: 0 });
  const lines = toCSV(result).trim().split('\n');
  assert.equal(lines[0], 'payment,year,amount_usd,present_value_usd');
  assert.equal(lines.slice(1).reduce((sum, line) => sum + parseAmount(line.split(',')[2]), 0), 100001);
});

test('CLI exports valid JSON and CSV and exits nonzero on bad arguments', () => {
  const cli = fileURLToPath(new URL('../bin/jackpot-annuity.js', import.meta.url));
  const run = args => execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  assert.equal(JSON.parse(run(['1000', '--payments', '2', '--growth', '0', '--format', 'json'])).totalCents, 100000);
  assert.ok(run(['1000']).startsWith('payment,year,'));
  assert.match(run(['--help']), /--discount/);
  for (const args of [['10', '--wat'], ['10', '--payments'], ['10', '--format', 'yaml'], ['10', '--discount', 'abc'], ['10', '--growth', '2', '--growth', '3']]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
  }
});
