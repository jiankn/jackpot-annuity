Examples
=============

Generate a schedule
------------------------

.. code-block:: javascript

   import { calculateAnnuity, toCSV } from 'jackpot-annuity';
   const result = calculateAnnuity({
     total: '450M', payments: 30, growthRate: 0.05,
     discountRate: 0.04, timing: 'due'
   });
   console.log(toCSV(result));

Immediate versus ordinary payments
---------------------------------------

.. code-block:: javascript

   import { presentValue } from 'jackpot-annuity';
   presentValue([10000, 11000], 0.1, 'due');      // 20000 cents
   presentValue([10000, 11000], 0.1, 'ordinary'); // 18182 cents

CLI export
---------------

.. code-block:: sh

   npx jackpot-annuity 1000.01 --payments 3 --growth 0 --discount 0

.. code-block:: text

   payment,year,amount_usd,present_value_usd
   1,0,333.34,333.34
   2,1,333.33,333.33
   3,2,333.34,333.34

Browser example
--------------------

The repository's ``examples/`` directory contains a standalone form and table
with CSV download. Serve the repository over HTTP, then open ``examples/``.
It imports ``../src/index.js`` directly; no bundler or network API is needed.

.. code-block:: sh

   python -m http.server 4187 --bind 127.0.0.1

Open ``http://127.0.0.1:4187/examples/``. For published packages, pin a version
when importing from a CDN to keep calculations reproducible across releases.
