jackpot-annuity
====================

Generate a growing annuity schedule, calculate its present value and export the
payments to CSV. The library works in Node.js 20+ and modern browsers with no
runtime dependencies. Dollar inputs become integer-cent monetary outputs.

For an interactive comparison with federal and state tax estimates, use the
`lottery annuity calculator <https://jackpotcalculator.com/lottery-annuity-calculator/>`_.
This package models payments before tax. It does not fetch live jackpots.

.. toctree::
   :maxdepth: 2

   api
   formulas
   examples
   cash-offer

Installation
-----------------

.. code-block:: sh

   npm install jackpot-annuity
   npx jackpot-annuity 450M --format csv > schedule.csv

Related
-------

* `Export annuity schedules to CSV without losing cents <https://dev.to/jiankn/export-annuity-schedules-to-csv-without-losing-cents-2e92>`_
  is a step-by-step tutorial built on this package.
* The `Jackpot Annuity editor extension <https://open-vsx.org/extension/jiankn/jackpot-annuity>`_
  on Open VSX generates CSV or JSON schedules inside VS Code or VSCodium, offline.

Source and bugs
--------------------

The `source repository <https://github.com/jiankn/jackpot-annuity>`_ includes a
browser demonstration, cross-platform tests, package verification and an MIT
license. Report bugs in `Issues <https://github.com/jiankn/jackpot-annuity/issues>`_.
