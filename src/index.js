/** Convert a dollar amount to integer cents without decimal multiplication loss. */
export function parseAmount(value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new TypeError('Amount must be a number or a dollar string.');
  }
  const text = String(value).trim();
  // Commas must be conventional three-digit groups, never silently discarded.
  const match = text.match(/^\$?(\d+|\d{1,3}(?:,\d{3})+)(?:\.(\d+))?([kmb])?$/i);
  if (!match) throw new RangeError('Use a nonnegative dollar amount, optionally with K, M or B.');
  const whole = match[1].replaceAll(',', '');
  const fraction = match[2] || '';
  if (whole.length + fraction.length > 100) throw new RangeError('Amount is too large or too precise.');
  const scale = { k: 1000n, m: 1000000n, b: 1000000000n }[match[3]?.toLowerCase()] || 1n;
  const numerator = BigInt(whole + fraction) * scale * 100n;
  const denominator = 10n ** BigInt(fraction.length);
  if (numerator % denominator !== 0n) throw new RangeError('Amount must resolve to whole cents.');
  const cents = numerator / denominator;
  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Amount exceeds safe integer cents.');
  return Number(cents);
}

function centsValue(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${name} must be nonnegative safe integer cents.`);
}

function rateValue(value, name, minimum = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > 1) {
    throw new RangeError(`${name} must be a finite decimal rate between ${minimum} and 1.`);
  }
}

function timingValue(timing) {
  if (timing !== 'due' && timing !== 'ordinary') throw new RangeError('Timing must be due or ordinary.');
}

/** Allocate a fixed total in cents across a geometrically changing payment stream. */
export function annuitySchedule(totalCents, payments = 30, growthRate = 0.05) {
  centsValue(totalCents, 'Total');
  if (!Number.isInteger(payments) || payments < 1 || payments > 1000) throw new RangeError('Payments must be an integer from 1 to 1000.');
  rateValue(growthRate, 'Growth rate', -1);
  if (growthRate === -1) throw new RangeError('Growth rate must be greater than -1.');
  const logGrowth = Math.log1p(growthRate);
  // Normalize against the largest weight to avoid overflow for long schedules.
  const offset = growthRate >= 0 ? payments - 1 : 0;
  const weights = Array.from({ length: payments }, (_, index) => Math.exp((index - offset) * logGrowth));
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  let cumulativeWeight = 0;
  let allocated = 0;
  return weights.map((weight, index) => {
    cumulativeWeight += weight;
    // Round cumulative allocations: no negative final payment on tiny totals.
    const boundary = index === payments - 1 ? totalCents : Math.max(allocated, Math.min(totalCents, Math.round(totalCents * (cumulativeWeight / weightTotal))));
    const amount = boundary - allocated;
    allocated = boundary;
    return amount;
  });
}

/** Discount caller-supplied gross or net cash flows, rounding only the final sum. */
export function presentValue(cashFlows, discountRate = 0.04, timing = 'due') {
  if (!Array.isArray(cashFlows) || cashFlows.length < 1 || cashFlows.length > 1000) throw new RangeError('Provide 1 to 1000 cash flows.');
  rateValue(discountRate, 'Discount rate');
  timingValue(timing);
  let nominal = 0;
  let value = 0;
  for (let index = 0; index < cashFlows.length; index++) {
    centsValue(cashFlows[index], 'Cash flow');
    nominal += cashFlows[index];
    if (!Number.isSafeInteger(nominal)) throw new RangeError('Cash flow total exceeds safe integer cents.');
    value += cashFlows[index] * Math.exp(-(index + (timing === 'ordinary' ? 1 : 0)) * Math.log1p(discountRate));
  }
  return Math.min(nominal, Math.round(value));
}

/** Create a tax-before schedule. Total is dollars; returned amounts are cents. */
export function calculateAnnuity({ total, payments = 30, growthRate = 0.05, discountRate = 0.04, timing = 'due' } = {}) {
  const totalCents = parseAmount(total);
  const amounts = annuitySchedule(totalCents, payments, growthRate);
  const value = presentValue(amounts, discountRate, timing);
  const rows = amounts.map((amountCents, index) => ({
    payment: index + 1,
    year: index + (timing === 'ordinary' ? 1 : 0),
    amountCents,
    presentValueCents: Math.round(amountCents * Math.exp(-(index + (timing === 'ordinary' ? 1 : 0)) * Math.log1p(discountRate))),
  }));
  return { totalCents, payments, growthRate, discountRate, timing, presentValueCents: value, rows };
}

function dollars(cents) {
  centsValue(cents, 'Amount');
  const value = BigInt(cents);
  return `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
}

/** Export generated rows as fixed decimal dollars, with LF newlines. */
export function toCSV(result) {
  return ['payment,year,amount_usd,present_value_usd', ...result.rows.map(row => `${row.payment},${row.year},${dollars(row.amountCents)},${dollars(row.presentValueCents)}`)].join('\n') + '\n';
}
