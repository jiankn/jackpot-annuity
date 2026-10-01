#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { calculateAnnuity, toCSV } from '../src/index.js';

const help = `Usage: jackpot-annuity <total> [options]

  total                 Dollars, e.g. 450M, 1.2B, or 1000.50
  --payments <count>    Number of payments (default 30)
  --growth <percent>    Annual growth as a percentage (default 5)
  --discount <percent>  Discount rate as a percentage (default 4)
  --timing <timing>     due (first payment now) or ordinary (in one year)
  --format <format>     csv (default) or json
  --version             Show version
  --help                Show help

Examples:
  jackpot-annuity 450M --format csv > schedule.csv
  jackpot-annuity 1000 --payments 10 --growth 0 --discount 0
Rates are percentages in the CLI and decimal fractions in the JS API.
Amounts are before tax; future tax rules are not modeled.
`;

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--version') {
    console.log(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version);
  } else if (args.length === 0 || (args.length === 1 && ['--help', '-h'].includes(args[0]))) {
    process.stdout.write(help);
  } else {
    const total = args.shift();
    const options = { total };
    let format = 'csv';
    const seen = new Set();
    while (args.length) {
      const flag = args.shift();
      if (!['--payments', '--growth', '--discount', '--timing', '--format'].includes(flag)) throw new Error(`Unknown option: ${flag}`);
      if (seen.has(flag)) throw new Error(`Repeated option: ${flag}`);
      seen.add(flag);
      const value = args.shift();
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
      if (flag === '--format') format = value;
      else if (flag === '--timing') options.timing = value;
      else {
        if (!/^-?\d+(?:\.\d+)?$/.test(value)) throw new Error(`Invalid number for ${flag}`);
        const number = Number(value);
        if (flag === '--payments') options.payments = number;
        else options[flag === '--growth' ? 'growthRate' : 'discountRate'] = number / 100;
      }
    }
    if (!['csv', 'json'].includes(format)) throw new Error('Format must be csv or json.');
    const result = calculateAnnuity(options);
    process.stdout.write(format === 'json' ? JSON.stringify(result, null, 2) + '\n' : toCSV(result));
  }
} catch (error) {
  console.error(`jackpot-annuity: ${error.message}`);
  process.exitCode = 1;
}
