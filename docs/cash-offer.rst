Compare a supplied cash offer
========================================

This example exports a reproducible payment schedule and compares its present
value with a cash offer supplied by the caller. Both amounts are hypothetical,
before tax, and expressed in dollars. The cash offer is an independent input;
it is never inferred from a fixed percentage of the advertised annuity.

Use an advertised total of $100,000,000, a quoted cash offer of $50,000,000,
30 payments, 5% annual payment growth and a 4% annual discount rate. The first
payment is immediate, so payment years are 0 through 29.

Run the example
----------------------------------------

Install the pinned release in an empty directory:

.. code-block:: sh

   npm init -y
   npm install jackpot-annuity@0.1.0

Save this as ``compare.mjs`` and run ``node compare.mjs``:

.. code-block:: javascript

   import { writeFile } from 'node:fs/promises';
   import { calculateAnnuity, parseAmount, toCSV } from 'jackpot-annuity';

   const result = calculateAnnuity({
     total: '100M',
     payments: 30,
     growthRate: 0.05,
     discountRate: 0.04,
     timing: 'due',
   });
   const cashOfferCents = parseAmount('50M');
   const paymentTotal = result.rows.reduce(
     (sum, row) => sum + row.amountCents, 0,
   );
   if (paymentTotal !== result.totalCents) {
     throw new Error('Payment amounts do not reconcile');
   }
   console.log({
     totalCents: result.totalCents,
     presentValueCents: result.presentValueCents,
     cashOfferCents,
     differenceCents: result.presentValueCents - cashOfferCents,
   });
   await writeFile('schedule.csv', toCSV(result), 'utf8');

Expected integer-cent output:

.. code-block:: text

   {
     totalCents: 10000000000,
     presentValueCents: 5205342203,
     cashOfferCents: 5000000000,
     differenceCents: 205342203
   }

The first payment is $1,505,143.51 and the last is $6,195,374.77. Their nominal
total is exactly $100,000,000.00. The present value is $52,053,422.03 under the
stated inputs. The difference is a model output, not a payout recommendation.

Change the discount assumption
----------------------------------------

Keep the payment schedule fixed and change only the annual discount rate:

==================== ===================
Annual discount rate Present value (USD)
==================== ===================
0%                   100,000,000.00
2%                   70,929,332.95
4%                   52,053,422.03
6%                   39,488,404.75
8%                   30,912,469.14
==================== ===================

These rates are illustrative parameters. The package does not select a rate,
estimate taxes, or predict returns. API rates are decimal fractions; CLI rates
are percentages. For example, ``discountRate: 0.04`` corresponds to
``--discount 4``.

CSV reconciliation and rounding
----------------------------------------

For a tiny reconciliation example, run:

.. code-block:: sh

   npx jackpot-annuity@0.1.0 1000.01 --payments 3 --growth 0 --discount 0

.. code-block:: text

   payment,year,amount_usd,present_value_usd
   1,0,333.34,333.34
   2,1,333.33,333.33
   3,2,333.34,333.34

Rounding each exact one-third share independently would produce three payments
of $333.34, overshooting by one cent. Instead, cumulative allocations are rounded
and adjacent differences become payments, preserving the supplied total.
Convert imported CSV monetary strings to integer cents before checking totals.
The aggregate present value is rounded once, while each row is rounded separately;
their displayed present values need not add to the aggregate exactly.

For an interactive comparison that also includes tax estimates, use the
`lottery annuity calculator <https://jackpotcalculator.com/lottery-annuity-calculator/>`_.
Its tax assumptions are separate from this package's before-tax cash-flow model.
