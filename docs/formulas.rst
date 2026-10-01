Formulas and assumptions
=============================

Given total T, payment count n and growth g, unrounded payment k is proportional
to (1+g)^k. When g is nonzero, the first payment is T*g/((1+g)^n-1). When g is
zero, each unrounded payment is T/n.

The implementation normalizes exponential weights against their largest
value. Cumulative amounts are rounded to cents, then adjacent differences form
the payments. This preserves T exactly and prevents negative final payments
for tiny totals. Extreme long schedules can have weights that round to zero.

For discount r, the aggregate present value is the sum of payment[k]/(1+r)^(k+t),
with t=0 for an immediate first payment and t=1 for a first payment in one year.
Aggregate present value is rounded after summation. Displayed per-row present
values are rounded separately and can differ from the aggregate by a few cents.

The default 30-payment, 5%-growth scenario reflects the annuity structure in
the `Powerball FAQ <https://www.powerball.com/faqs>`_. Both the payment count
and rate are configurable, rather than assertions about every lottery product.

Taxes and current jackpot data
-----------------------------------

The library does not estimate taxes, predict future tax brackets or infer a
cash-option ratio. Pass caller-computed net cash flows to ``presentValue`` to
discount them. For interactive state-specific estimates, compare the
`lottery annuity calculator <https://jackpotcalculator.com/lottery-annuity-calculator/>`_
and its `methodology <https://jackpotcalculator.com/methodology/>`_.
