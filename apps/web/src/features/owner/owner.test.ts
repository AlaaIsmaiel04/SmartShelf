import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createOwnerPharmacyService } from './owner-api';
import { ApiRequestError } from '../../lib/api';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('owner filters encode literal names and attach the signed-in bearer token', async () => {
  const controller = new AbortController();
  globalThis.fetch = async (url, init) => {
    assert.equal(
      String(url),
      '/api/owner/pharmacies?q=A%25+%26+B&status=SUSPENDED',
    );
    assert.equal(
      new Headers(init?.headers).get('Authorization'),
      'Bearer owner-token',
    );
    assert.equal(init?.signal, controller.signal);
    return Response.json({ items: [], total: 0 });
  };
  await createOwnerPharmacyService('owner-token', () => {}).list(
    { q: '  A% & B  ', status: 'SUSPENDED' },
    controller.signal,
  );
});

test('owner mutations use real agreed endpoints, POST/PATCH subscription choice and empty DELETE response', async () => {
  const calls: { path: string; method: string; body: unknown }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({
      path: String(url),
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(String(init.body)) : null,
    });
    return init?.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : Response.json({ id: 'created' }, { status: 201 });
  };
  const service = createOwnerPharmacyService('token', () => {});
  const pharmacy = {
    name: 'New pharmacy',
    area: 'North',
    address: 'Street',
    phone: '0123',
  };
  const account = {
    pharmacyId: 'pharmacy-1',
    email: 'staff@example.test',
    password: 'TestOnly123!',
  };
  const subscription = {
    startDate: '2026-11-10',
    endDate: '2026-12-10',
    suspended: false,
  };
  await service.create(pharmacy);
  await service.createPharmacist(account);
  await service.saveSubscription('id/1', subscription, false);
  await service.saveSubscription(
    'id/1',
    { ...subscription, suspended: true },
    true,
  );
  assert.equal(await service.deleteSubscription('id/1'), undefined);
  assert.deepEqual(calls, [
    { path: '/api/owner/pharmacies', method: 'POST', body: pharmacy },
    { path: '/api/owner/pharmacists', method: 'POST', body: account },
    {
      path: '/api/owner/pharmacies/id%2F1/subscription',
      method: 'POST',
      body: subscription,
    },
    {
      path: '/api/owner/pharmacies/id%2F1/subscription',
      method: 'PATCH',
      body: { ...subscription, suspended: true },
    },
    {
      path: '/api/owner/pharmacies/id%2F1/subscription',
      method: 'DELETE',
      body: null,
    },
  ]);
});

test('owner 400/403/404/409 errors preserve server validation and resource reasons without expiring a valid session', async () => {
  let invalidations = 0;
  const service = createOwnerPharmacyService('token', () => {
    invalidations += 1;
  });
  for (const [status, message] of [
    [
      400,
      ['startDate must be a valid date', 'endDate must be after startDate.'],
    ],
    [403, 'Forbidden resource'],
    [404, 'Pharmacy not found.'],
    [409, 'An account with this email already exists.'],
  ] as const) {
    globalThis.fetch = async () => Response.json({ message }, { status });
    await assert.rejects(
      service.list({}),
      (error: unknown) =>
        error instanceof ApiRequestError &&
        error.status === status &&
        error.message ===
          (Array.isArray(message) ? message.join(' ') : message),
    );
  }
  assert.equal(invalidations, 0);
});

test('owner 401 invalidates the session and shows the shared sign-in-again notice', async () => {
  let invalidations = 0;
  globalThis.fetch = async () =>
    Response.json({ message: 'Unauthorized' }, { status: 401 });
  await assert.rejects(
    createOwnerPharmacyService('expired', () => {
      invalidations += 1;
    }).list({}),
    (error: unknown) =>
      error instanceof ApiRequestError &&
      error.status === 401 &&
      error.message === 'Your session has expired. Please sign in again.',
  );
  assert.equal(invalidations, 1);
});

test('owner network/aborted requests reject without fabricating pharmacy data or clearing a valid session', async () => {
  let invalidations = 0;
  globalThis.fetch = async () => {
    throw new TypeError('Network unavailable');
  };
  const service = createOwnerPharmacyService('token', () => {
    invalidations += 1;
  });
  await assert.rejects(service.list({}), /Network unavailable/);
  globalThis.fetch = async () => {
    throw new DOMException('Cancelled', 'AbortError');
  };
  await assert.rejects(service.list({}), { name: 'AbortError' });
  assert.equal(invalidations, 0);
});
