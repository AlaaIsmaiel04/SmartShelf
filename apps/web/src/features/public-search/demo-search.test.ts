import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { searchDemoMedicines } from './demo-search';
const now = new Date('2026-11-13T09:00:00Z');
test('demo matches Arabic, scientific and brand names and filters simulated duty', () => {
  const brand = searchDemoMedicines({ q: ' PANADOL ', area: 'سلمية' }, now);
  assert.equal(brand.total, 4);
  assert.deepEqual(searchDemoMedicines({ q: 'باراسيتامول' }, now), brand);
  assert.deepEqual(searchDemoMedicines({ q: 'paracetamol' }, now), brand);
  const onDuty = searchDemoMedicines({ q: 'panadol', onDutyNow: true }, now);
  assert.equal(onDuty.total, 2);
  assert.ok(
    onDuty.items.every(
      (pharmacy) => pharmacy.onDutyNow && pharmacy.currentDuty,
    ),
  );
  assert.equal(brand.items.filter((pharmacy) => !pharmacy.onDutyNow).length, 2);
});
test('demo never supplies real contacts or leaks stock and does not invent matches', () => {
  assert.equal(searchDemoMedicines({ q: 'unknown-medicine' }, now).total, 0);
  assert.equal(searchDemoMedicines({ q: '' }, now).total, 0);
  assert.equal(
    searchDemoMedicines({ q: 'panadol', area: 'Amman' }, now).total,
    0,
  );
  const result = searchDemoMedicines({ q: 'am' }, now);
  assert.equal(
    new Set(result.items.map((item) => item.name)).size,
    result.total,
  );
  for (const item of result.items) {
    assert.equal(item.phone, '');
    assert.ok(item.name.includes('التجريبية'));
    assert.equal(item.area, 'سلمية');
    assert.ok(!('quantity' in item));
    assert.ok(!('price' in item));
  }
});
