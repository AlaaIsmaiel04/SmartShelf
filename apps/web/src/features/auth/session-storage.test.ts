import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  isSessionUser,
  readSessionToken,
  SESSION_TOKEN_KEY,
  storeSessionToken,
} from './session-storage';

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
afterEach(() => {
  if (originalWindow)
    Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
});

test('tab storage saves only the token, restores it and removes it on sign-out', () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      sessionStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    },
  });
  assert.equal(readSessionToken(), null);
  storeSessionToken('test-access-token');
  assert.deepEqual([...values.keys()], [SESSION_TOKEN_KEY]);
  assert.equal(readSessionToken(), 'test-access-token');
  storeSessionToken(null);
  assert.equal(readSessionToken(), null);
  values.set(SESSION_TOKEN_KEY, ' ');
  assert.equal(readSessionToken(), null);
  values.set(SESSION_TOKEN_KEY, 'x'.repeat(8193));
  assert.equal(readSessionToken(), null);
});

test('blocked session storage does not crash authentication', () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    get() {
      throw new Error('Storage denied');
    },
  });
  assert.equal(readSessionToken(), null);
  assert.doesNotThrow(() => storeSessionToken('token'));
  assert.doesNotThrow(() => storeSessionToken(null));
});

test('restoration validates server account shape before trusting role or pharmacy', () => {
  assert.ok(
    isSessionUser({
      id: 'a',
      email: 'a@example.test',
      role: 'OWNER',
      pharmacyId: null,
    }),
  );
  assert.ok(
    isSessionUser({
      id: 'a',
      email: 'a@example.test',
      role: 'PHARMACIST',
      pharmacyId: 'p',
    }),
  );
  for (const user of [
    null,
    {},
    { id: 'a', email: 'a@example.test', role: 'ADMIN', pharmacyId: null },
    { id: 'a', email: 'a@example.test', role: 'PHARMACIST', pharmacyId: null },
  ])
    assert.equal(isSessionUser(user), false);
});
