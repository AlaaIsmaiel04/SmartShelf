import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeBatchStock } from './batch-stock-summary';

test('mixed stock distinguishes expired batches from usable and near-expiry stock', () => {
  assert.deepEqual(
    summarizeBatchStock([
      { quantity: 5, indicators: ['EXPIRED'] },
      { quantity: 5, indicators: [] },
      { quantity: 2, indicators: ['EXPIRING_SOON'] },
    ]),
    { expired: 1, usable: 2 },
  );
});

test('empty unexpired batches do not make entirely expired stock look usable', () => {
  assert.deepEqual(
    summarizeBatchStock([
      { quantity: 5, indicators: ['EXPIRED'] },
      { quantity: 0, indicators: [] },
    ]),
    { expired: 1, usable: 0 },
  );
});

test('empty expired batches do not raise a stock warning; no batches means no stock', () => {
  assert.deepEqual(
    summarizeBatchStock([
      { quantity: 0, indicators: ['EXPIRED'] },
      { quantity: 5, indicators: [] },
    ]),
    { expired: 0, usable: 1 },
  );
  assert.deepEqual(summarizeBatchStock([]), { expired: 0, usable: 0 });
});
