import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ValidationPipe } from '@nestjs/common';
import { CreateMedicineDto, MedicineDto } from './inventory.dto';
const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
const base = { displayName: 'Test', category: 'Demo', reorderThreshold: 0 };
const batch = {
  batchNumber: 'B-1',
  quantity: 0,
  expiryDate: '2027-02-28',
  storageLocation: 'A',
  unitCost: '0.00',
};
test('scientific name may be omitted or empty; first-batch input is validated recursively', async () => {
  const validate = (body: unknown) =>
    pipe.transform(body, { type: 'body', metatype: CreateMedicineDto });
  assert.equal((await validate(base)).scientificName, undefined);
  assert.equal(
    (await validate({ ...base, scientificName: '   ', initialBatch: batch }))
      .scientificName,
    '',
  );
  for (const initialBatch of [
    null,
    [],
    'invalid',
    { ...batch, quantity: -1 },
    { ...batch, unitCost: '1.234' },
    { ...batch, pharmacyId: 'other' },
    { ...batch, quantity: undefined },
  ]) {
    await assert.rejects(validate({ ...base, initialBatch }));
  }
  await assert.rejects(validate({ ...base, scientificName: 123 }));
  await assert.rejects(
    pipe.transform(
      { ...base, initialBatch: batch },
      { type: 'body', metatype: MedicineDto },
    ),
  );
});
