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

Installation
-----------------

Until npm registry publication completes, install the tested GitHub release
tarball. After publication, ``npm install jackpot-annuity`` is also available.

.. code-block:: sh

   npm install https://github.com/jiankn/jackpot-annuity/releases/download/v0.1.0/jackpot-annuity-0.1.0.tgz
   npx jackpot-annuity 450M --format csv > schedule.csv

Source and bugs
--------------------

The `source repository <https://github.com/jiankn/jackpot-annuity>`_ includes a
browser demonstration, cross-platform tests, package verification and an MIT
license. Report bugs in `Issues <https://github.com/jiankn/jackpot-annuity/issues>`_.
