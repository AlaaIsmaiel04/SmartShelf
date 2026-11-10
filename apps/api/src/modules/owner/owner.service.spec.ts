import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare } from 'bcryptjs';
import type { PrismaService } from '../../prisma/prisma.service';
import {
  businessDate,
  addCalendarDays,
  parseCalendarDate,
} from '../../common/business-date';
import { OwnerService } from './owner.service';

test('owner name searches escape PostgreSQL wildcard and escape characters', async () => {
  for (const [q, expected] of [
    ['%', '\\%'],
    ['_', '\\_'],
    ['\\', '\\\\'],
    ['A%_\\B', 'A\\%\\_\\\\B'],
    ['ordinary', 'ordinary'],
  ]) {
    let actual: unknown;
    const service = new OwnerService({
      pharmacy: {
        findMany: async (input: unknown) => {
          actual = input;
          return [];
        },
      },
    } as unknown as PrismaService);
    await service.listPharmacies({ q });
    assert.deepEqual((actual as { where: unknown }).where, {
      name: { contains: expected, mode: 'insensitive' },
    });
  }
});

test('list filters by calculated status after mapping and returns the filtered total', async () => {
  const today = businessDate();
  const pharmacy = {
    id: 'p',
    name: 'Example',
    area: 'North',
    address: 'A',
    phone: '0',
    inventoryUpdatedAt: null,
  };
  const fake = {
    pharmacy: {
      findMany: async () => [
        { ...pharmacy, id: 'none', subscription: null },
        {
          ...pharmacy,
          id: 'active',
          subscription: {
            id: 's1',
            pharmacyId: 'active',
            suspended: false,
            startDate: parseCalendarDate(today),
            endDate: parseCalendarDate(addCalendarDays(today, 5)),
          },
        },
        {
          ...pharmacy,
          id: 'expired',
          subscription: {
            id: 's2',
            pharmacyId: 'expired',
            suspended: false,
            startDate: parseCalendarDate(addCalendarDays(today, -5)),
            endDate: parseCalendarDate(addCalendarDays(today, -1)),
          },
        },
      ],
    },
  };
  const service = new OwnerService(fake as unknown as PrismaService);
  const result = await service.listPharmacies({ status: 'ACTIVE' });
  assert.equal(result.total, 1);
  assert.equal(result.items[0].id, 'active');
  assert.equal(result.items[0].subscriptionStatus, 'ACTIVE');
  assert.equal(result.items[0].subscription!.startDate, today);
});

test('account creation normalizes email, forces PHARMACIST, hashes password and returns safe fields', async () => {
  let saved: Record<string, unknown> = {};
  const fake = {
    pharmacy: { findUnique: async () => ({ id: 'p' }) },
    account: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        saved = data;
        return {
          id: 'a',
          email: data.email,
          role: data.role,
          pharmacyId: data.pharmacyId,
        };
      },
    },
  };
  const service = new OwnerService(fake as unknown as PrismaService);
  const result = await service.createPharmacist({
    email: ' USER@EXAMPLE.COM ',
    password: 'DemoPass123!',
    pharmacyId: 'p',
  });
  assert.equal(saved.email, 'user@example.com');
  assert.equal(saved.role, 'PHARMACIST');
  assert.ok(await compare('DemoPass123!', saved.passwordHash as string));
  assert.deepEqual(Object.keys(result).sort(), [
    'email',
    'id',
    'pharmacyId',
    'role',
  ]);
});

test('subscription dates are validated before writing to persistence', async () => {
  const service = new OwnerService({} as PrismaService);
  for (const dto of [
    { startDate: '2026-02-30', endDate: '2026-04-01', suspended: false },
    { startDate: '2026-11-02', endDate: '2026-11-02', suspended: false },
    { startDate: '2026-11-02', endDate: '2026-11-01', suspended: false },
  ])
    await assert.rejects(service.createSubscription('p', dto));
});
