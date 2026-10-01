import { calculateAnnuity, toCSV } from '../src/index.js';

const form = document.querySelector('#calculator');
const error = document.querySelector('#error');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
let result;
function calculate() {
  try {
    const inputs = new FormData(form);
    result = calculateAnnuity({
      total: inputs.get('total'), payments: Number(inputs.get('payments')),
      growthRate: Number(inputs.get('growth')) / 100,
      discountRate: Number(inputs.get('discount')) / 100, timing: inputs.get('timing'),
    });
    error.hidden = true;
    document.querySelector('#results').hidden = false;
    document.querySelector('#nominal').textContent = usd.format(result.totalCents / 100);
    document.querySelector('#pv').textContent = usd.format(result.presentValueCents / 100);
    document.querySelector('#first').textContent = usd.format(result.rows[0].amountCents / 100);
    document.querySelector('#rows').replaceChildren(...result.rows.map(row => {
      const tr = document.createElement('tr');
      for (const value of [row.payment, row.year, usd.format(row.amountCents / 100), usd.format(row.presentValueCents / 100)]) {
        const td = document.createElement('td'); td.textContent = value; tr.append(td);
      }
      return tr;
    }));
  } catch (failure) {
    result = undefined;
    error.textContent = failure.message;
    error.hidden = false;
    document.querySelector('#results').hidden = true;
  }
}
form.addEventListener('submit', event => { event.preventDefault(); calculate(); });
document.querySelector('#download').addEventListener('click', () => {
  if (!result) return;
  const url = URL.createObjectURL(new Blob([toCSV(result)], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'annuity-schedule.csv'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
calculate();
