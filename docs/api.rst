API reference
==================

Rates in the JavaScript API are fractions; 0.05 means 5%. CLI rates are percentages.
All returned amounts are integer cents. Total dollar inputs may use strings such
as ``450M``, ``$1,234.56`` or ``1.2B``.

calculateAnnuity(options)
------------------------------

``total`` is required. Defaults are ``payments=30``, ``growthRate=0.05``,
``discountRate=0.04`` and ``timing='due'``. The return object contains these
settings, ``totalCents``, ``presentValueCents`` and ``rows``. Each row contains
``payment`` (one-based), ``year``, ``amountCents`` and ``presentValueCents``.

annuitySchedule(totalCents, payments=30, growthRate=0.05)
--------------------------------------------------------------

Returns an integer-cent array. Its sum equals the exact input total. Payments
must be 1–1000. Growth must be greater than -1 and at most 1. Zero growth gives
equal unrounded payments; rounding distributes indivisible cents.

presentValue(cashFlows, discountRate=0.04, timing='due')
-------------------------------------------------------------

Accepts 1–1000 nonnegative integer-cent flows and returns an aggregate value
rounded once. Discount must be between 0 and 1. Use ``due`` for years 0…n−1,
``ordinary`` for years 1…n. Flows may be gross or caller-computed net amounts.

parseAmount(value)
-----------------------

Parses dollar numbers or strings into cents. Conventional comma groups and
K/M/B suffixes are allowed; scientific notation strings and fractions of a
cent are rejected. Neither individual amounts nor combined flows may exceed
``Number.MAX_SAFE_INTEGER`` cents. Use strings for large inputs to preserve cents.

toCSV(result)
------------------

Exports a calculation result as LF-terminated CSV with columns
``payment,year,amount_usd,present_value_usd``. Monetary cells use two decimal
places and no thousands separators. JSON output retains integer-cent fields.

Validation errors
----------------------

Invalid amounts, rates, payment counts, timing or unsafe integers throw
``RangeError`` (invalid amount input types throw ``TypeError``). The CLI writes
a concise message to stderr and exits with status 1. It does not silently
replace invalid parameters with defaults.
