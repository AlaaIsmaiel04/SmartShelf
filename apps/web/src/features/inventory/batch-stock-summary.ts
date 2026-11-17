import type { Batch } from '@smartshelf/contracts';

// Use the API's Syria-time expiry flags; an empty batch is not usable stock.
export function summarizeBatchStock(
  batches: Pick<Batch, 'quantity' | 'indicators'>[],
) {
  let expired = 0;
  let usable = 0;
  for (const batch of batches) {
    if (batch.quantity <= 0) continue;
    if (batch.indicators.includes('EXPIRED')) expired += 1;
    else usable += 1;
  }
  return { expired, usable };
}
