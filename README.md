# jackpot-annuity

Generate growing annuity schedules, compare their present value and export CSV files. Works in Node.js and modern browsers, with no runtime dependencies. Monetary outputs are integer cents, and payments always add up to the exact input total.

This is the standalone annuity component from [Jackpot Calculator](https://jackpotcalculator.com/lottery-annuity-calculator/). Compare the generated schedule with the interactive lottery annuity calculator when you need federal and state tax estimates. This package computes amounts **before tax**; it does not predict future tax rules or winning numbers.

## Install

```sh
npm install jackpot-annuity
```

Node.js 20 or newer. This package is an ES module.

## Library

```js
import { calculateAnnuity, toCSV, presentValue } from 'jackpot-annuity';

const result = calculateAnnuity({
  total: '450M',
  payments: 30,
  growthRate: 0.05,
  discountRate: 0.04,
  timing: 'due', // first payment immediately, at year 0
});

console.log(result.totalCents); // 45000000000
console.log(result.rows[0]); // payment, year, amountCents, presentValueCents
console.log(toCSV(result));

// If you already have after-tax cash flows, pass integer cents directly:
console.log(presentValue([6300, 6930], 0.1, 'due')); // 12600 cents
```

API rates are decimal fractions: `0.05` means 5%. `total` is in dollars; `annuitySchedule` and `presentValue` take **integer cents**. All returned money fields are cents.

## CLI

```sh
npx jackpot-annuity 450M --format csv > schedule.csv
npx jackpot-annuity 1.2B --discount 5 --timing ordinary --format json
npx jackpot-annuity 1000 --payments 10 --growth 0 --discount 0
```

CLI rates are percentages: `--growth 5` means 5%. Defaults: 30 payments, 5% growth, 4% discount, first payment immediately, CSV output. Use `--help` for options.

## Browser demo

Serve this repository with any static HTTP server and open `examples/`. It includes input controls, a payment table, present-value comparison and a CSV download. No analytics or network calls are used by the calculator.

```sh
python -m http.server 4187 --bind 127.0.0.1
# Open http://127.0.0.1:4187/examples/
```

Browser imports can also use a pinned published npm version:

```js
import { calculateAnnuity } from 'https://unpkg.com/jackpot-annuity@0.1.0/src/index.js';
```

## API and limits

| Function | Input | Output |
|---|---|---|
| `parseAmount(value)` | Dollar number or string; optional `$`, grouped commas, K/M/B | Integer cents |
| `annuitySchedule(totalCents, payments=30, growthRate=0.05)` | Total in cents, 1–1000 payments, decimal growth | Integer-cent payment array |
| `presentValue(cashFlows, discountRate=0.04, timing='due')` | 1–1000 nonnegative integer-cent flows | Present value in integer cents |
| `calculateAnnuity(options)` | Dollar total, optional count, rates, timing | Result object and payment rows |
| `toCSV(result)` | Result from `calculateAnnuity` | CSV with fixed two-decimal USD columns |

Amounts must resolve to whole cents and must not exceed `Number.MAX_SAFE_INTEGER` cents. For large values use strings to avoid precision loss before the API receives a JavaScript number. Scientific-notation strings are not accepted. Growth must be greater than -100% and at most 100%; discount must be 0–100%. Both rates are annual and constant. There are no payment fees, inflation adjustments or tax assumptions.

`timing: 'due'` pays at years 0 through n−1; `ordinary` pays at years 1 through n. A payment number is one-based in both cases.

## Formula and rounding

For n payments and annual growth g, unrounded amounts are proportional to `(1+g)^k`, for k=0…n−1. If g=0, they are equal. The implementation normalizes these weights to avoid numeric overflow, rounds cumulative allocations to cents and takes successive differences. This guarantees that even a one-cent payout split into 30 payments has no negative payments and sums to one cent. Individual rounded payments can differ from the exact geometric ratio by cents.

Present value is `sum(payment[k] / (1+r)^(k+t))`, with t=0 for due and t=1 for ordinary. The aggregate is rounded once. Each displayed row is rounded separately, so adding displayed row present values can differ from the aggregate by a few cents. Very long schedules with extreme rates can have weights below floating-point precision; their allocated payments round to zero.

The default 30-payment, 5%-growth scenario follows the annuity structure described in the [Powerball FAQ](https://www.powerball.com/faqs). Inputs are configurable; the package does not fetch current jackpot amounts.

## Development and release

```sh
npm ci
npm run check
npm test
npm run verify:package
```

Package verification builds a tarball, checks the public file allowlist, installs it into a temporary project and invokes both the installed API and CLI. CI runs on Windows and Linux with Node 20, 22 and 24. The documentation source is in `docs/` with a Read the Docs configuration.

See [CHANGELOG.md](./CHANGELOG.md) for versions and [LICENSE](./LICENSE) for the MIT license. Report bugs through [GitHub Issues](https://github.com/jiankn/jackpot-annuity/issues).
