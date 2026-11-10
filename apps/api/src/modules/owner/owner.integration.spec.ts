import 'reflect-metadata';
import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { businessDate, addCalendarDays } from '../../common/business-date';

test(
  'owner HTTP and PostgreSQL acceptance',
  { skip: process.env.RUN_DB_TESTS !== 'true' },
  async (t) => {
    assert.match(
      new URL(process.env.DATABASE_URL!).pathname,
      /^\/smartshelf_test(?:_[a-z0-9_]+)?$/,
      'Use a dedicated test database',
    );
    const { AppModule } = require('../../../dist/app.module');
    const prisma = new PrismaClient();
    const ownerId = randomUUID(),
      initialId = randomUUID(),
      staffId = randomUUID();
    const pharmacyIds: string[] = [initialId];
    let base = '';
    async function start() {
      const instance = await NestFactory.create(AppModule, { logger: false });
      instance.setGlobalPrefix('api');
      instance.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await instance.listen(0, '127.0.0.1');
      base = (await instance.getUrl()) + '/api';
      return instance;
    }
    let app = await start();
    async function call(
      method: string,
      path: string,
      token?: string,
      body?: unknown,
    ) {
      const response = await fetch(base + path, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      const text = await response.text();
      return { status: response.status, body: text ? JSON.parse(text) : null };
    }
    const email = `owner-${ownerId}@test.invalid`,
      staffEmail = `staff-${staffId}@test.invalid`;
    const today = businessDate(),
      subscription = {
        startDate: today,
        endDate: addCalendarDays(today, 10),
        suspended: false,
      };
    try {
      const passwordHash = await hash('DemoPass123!', 10);
      await prisma.pharmacy.create({
        data: {
          id: initialId,
          name: 'Initial review pharmacy',
          area: 'North',
          address: 'A',
          phone: '1',
        },
      });
      await prisma.account.createMany({
        data: [
          { id: ownerId, email, passwordHash, role: 'OWNER' },
          {
            id: staffId,
            email: staffEmail,
            passwordHash,
            role: 'PHARMACIST',
            pharmacyId: initialId,
          },
        ],
      });
      const owner = (
        await call('POST', '/auth/login', undefined, {
          email,
          password: 'DemoPass123!',
        })
      ).body.accessToken as string;
      const staff = (
        await call('POST', '/auth/login', undefined, {
          email: staffEmail,
          password: 'DemoPass123!',
        })
      ).body.accessToken as string;
      const missing = randomUUID();
      await t.test(
        'all owner routes reject anonymous and pharmacist access before validation',
        async () => {
          for (const [method, path] of [
            ['GET', '/owner/pharmacies'],
            ['POST', '/owner/pharmacies'],
            ['POST', '/owner/pharmacists'],
            ['POST', `/owner/pharmacies/${missing}/subscription`],
            ['PATCH', `/owner/pharmacies/${missing}/subscription`],
            ['DELETE', `/owner/pharmacies/${missing}/subscription`],
          ]) {
            assert.equal(
              (
                await call(
                  method,
                  path,
                  undefined,
                  method === 'GET' || method === 'DELETE' ? undefined : {},
                )
              ).status,
              401,
            );
            assert.equal(
              (
                await call(
                  method,
                  path,
                  staff,
                  method === 'GET' || method === 'DELETE' ? undefined : {},
                )
              ).status,
              403,
            );
          }
        },
      );
      await t.test(
        'invalid UUID, unknown fields and invalid filters are rejected',
        async () => {
          assert.equal(
            (await call('GET', '/owner/pharmacies?status=INVALID', owner))
              .status,
            400,
          );
          assert.equal(
            (await call('GET', '/owner/pharmacies?unknown=x', owner)).status,
            400,
          );
          assert.equal(
            (
              await call(
                'POST',
                '/owner/pharmacies/no-uuid/subscription',
                owner,
                subscription,
              )
            ).status,
            400,
          );
          assert.equal(
            (
              await call('POST', '/owner/pharmacies', owner, {
                name: ' ',
                area: 'A',
                address: 'B',
                phone: '1',
              })
            ).status,
            400,
          );
          assert.equal(
            (
              await call('POST', '/owner/pharmacies', owner, {
                name: 'N',
                area: 'A',
                address: 'B',
                phone: '1',
                role: 'OWNER',
              })
            ).status,
            400,
          );
        },
      );
      let id = '';
      await t.test(
        'create pharmacy returns the agreed safe NONE response',
        async () => {
          const response = await call('POST', '/owner/pharmacies', owner, {
            name: `Owner Review ${ownerId}`,
            area: 'North',
            address: 'A',
            phone: '1',
          });
          assert.equal(response.status, 201);
          id = response.body.id;
          pharmacyIds.push(id);
          assert.equal(response.body.subscriptionStatus, 'NONE');
          assert.equal(response.body.subscription, null);
          assert.deepEqual(
            Object.keys(response.body).sort(),
            [
              'id',
              'name',
              'area',
              'address',
              'phone',
              'inventoryUpdatedAt',
              'subscription',
              'subscriptionStatus',
            ].sort(),
          );
        },
      );
      await t.test(
        'name search is literal for percent, underscore and backslash and remains case-insensitive',
        async () => {
          for (const symbol of ['%', '_', '\\']) {
            const pharmacy = await prisma.pharmacy.create({
              data: {
                name: `Literal ${ownerId} ${symbol}`,
                area: 'A',
                address: 'B',
                phone: '1',
              },
            });
            pharmacyIds.push(pharmacy.id);
            const result = await call(
              'GET',
              '/owner/pharmacies?q=' + encodeURIComponent(symbol),
              owner,
            );
            assert.equal(result.status, 200);
            assert.ok(
              result.body.items.some(
                (item: { id: string }) => item.id === pharmacy.id,
              ),
            );
            assert.ok(
              result.body.items.every((item: { name: string }) =>
                item.name.includes(symbol),
              ),
            );
            assert.equal(result.body.total, result.body.items.length);
          }
          const result = await call(
            'GET',
            '/owner/pharmacies?q=' +
              encodeURIComponent(`  owner review ${ownerId}  `),
            owner,
          );
          assert.equal(result.body.total, 1);
          assert.equal(result.body.items[0].id, id);
        },
      );
      let pharmacistToken = '';
      await t.test(
        'create pharmacist normalizes email, hashes password, rejects duplicates and never exposes hash',
        async () => {
          const input = {
            email: ` NEW-${ownerId}@TEST.INVALID `,
            password: 'DemoPass123!',
            pharmacyId: id,
          };
          const response = await call(
            'POST',
            '/owner/pharmacists',
            owner,
            input,
          );
          assert.equal(response.status, 201);
          assert.equal(response.body.email, input.email.trim().toLowerCase());
          assert.deepEqual(
            Object.keys(response.body).sort(),
            ['id', 'email', 'role', 'pharmacyId'].sort(),
          );
          assert.equal(response.body.role, 'PHARMACIST');
          const persisted = await prisma.account.findUniqueOrThrow({
            where: { id: response.body.id },
          });
          assert.notEqual(persisted.passwordHash, input.password);
          assert.ok(await compare(input.password, persisted.passwordHash));
          assert.equal(
            (await call('POST', '/owner/pharmacists', owner, input)).status,
            409,
          );
          assert.equal(
            (
              await call('POST', '/owner/pharmacists', owner, {
                ...input,
                email: `missing-${ownerId}@test.invalid`,
                pharmacyId: missing,
              })
            ).status,
            404,
          );
          assert.equal(
            (
              await call('POST', '/owner/pharmacists', owner, {
                ...input,
                password: 'short',
              })
            ).status,
            400,
          );
          pharmacistToken = (
            await call('POST', '/auth/login', undefined, {
              email: persisted.email,
              password: input.password,
            })
          ).body.accessToken;
        },
      );
      const endpoint = () => `/owner/pharmacies/${id}/subscription`;
      await t.test(
        'subscription validates real dates and reports missing resources',
        async () => {
          for (const input of [
            { ...subscription, startDate: '2026-02-30' },
            { ...subscription, endDate: today },
            { ...subscription, endDate: addCalendarDays(today, -1) },
            { ...subscription, suspended: 'false' },
            { ...subscription, extra: true },
          ])
            assert.equal(
              (await call('POST', endpoint(), owner, input)).status,
              400,
            );
          assert.equal(
            (
              await call(
                'POST',
                `/owner/pharmacies/${missing}/subscription`,
                owner,
                subscription,
              )
            ).status,
            404,
          );
          assert.equal(
            (await call('PATCH', endpoint(), owner, subscription)).status,
            404,
          );
          assert.equal((await call('DELETE', endpoint(), owner)).status, 404);
        },
      );
      await t.test(
        'concurrent subscription creation allows only one and returns 409 for the other',
        async () => {
          const results = await Promise.all([
            call('POST', endpoint(), owner, subscription),
            call('POST', endpoint(), owner, subscription),
          ]);
          assert.deepEqual(
            results.map((result) => result.status).sort(),
            [201, 409],
          );
          assert.equal(
            await prisma.subscription.count({ where: { pharmacyId: id } }),
            1,
          );
        },
      );
      const drugName = `Review drug ${ownerId}`;
      await t.test(
        'active pharmacist creates persisted stock and duty for lifecycle verification',
        async () => {
          const med = await call(
            'POST',
            '/pharmacist/medicines',
            pharmacistToken,
            {
              displayName: drugName,
              scientificName: 'Review generic',
              category: 'Test',
              reorderThreshold: 5,
            },
          );
          assert.equal(med.status, 201);
          assert.equal(
            (
              await call(
                'POST',
                `/pharmacist/medicines/${med.body.id}/batches`,
                pharmacistToken,
                {
                  batchNumber: 'B1',
                  quantity: 10,
                  expiryDate: addCalendarDays(today, 100),
                  storageLocation: 'A',
                  unitCost: '2.50',
                },
              )
            ).status,
            201,
          );
          const now = new Date();
          assert.equal(
            (
              await call('POST', '/pharmacist/duty-periods', pharmacistToken, {
                startsAt: now.toISOString(),
                endsAt: new Date(now.getTime() + 3600000).toISOString(),
              })
            ).status,
            201,
          );
        },
      );
      async function expectState(status: string, visible: boolean) {
        const list = await call(
          'GET',
          '/owner/pharmacies?q=' +
            encodeURIComponent('Owner Review ' + ownerId) +
            '&status=' +
            status,
          owner,
        );
        assert.equal(list.body.total, 1);
        assert.equal(list.body.items[0].id, id);
        assert.equal(list.body.items[0].subscriptionStatus, status);
        const result = await call(
          'GET',
          '/public/medicines?q=' + encodeURIComponent(drugName),
        );
        assert.equal(result.status, 200);
        assert.equal(
          result.body.items.some(
            (row: { name: string }) => row.name === `Owner Review ${ownerId}`,
          ),
          visible,
        );
      }
      await t.test(
        'effective status filters and public visibility follow inclusive dates, suspension, expiry and future start',
        async () => {
          for (const [input, status, visible] of [
            [subscription, 'ACTIVE', true],
            [
              {
                ...subscription,
                startDate: addCalendarDays(today, -1),
                endDate: today,
              },
              'ACTIVE',
              true,
            ],
            [{ ...subscription, suspended: true }, 'SUSPENDED', false],
            [
              {
                startDate: addCalendarDays(today, -3),
                endDate: addCalendarDays(today, -1),
                suspended: true,
              },
              'SUSPENDED',
              false,
            ],
            [
              {
                startDate: addCalendarDays(today, -3),
                endDate: addCalendarDays(today, -1),
                suspended: false,
              },
              'EXPIRED',
              false,
            ],
            [
              {
                startDate: addCalendarDays(today, 1),
                endDate: addCalendarDays(today, 10),
                suspended: false,
              },
              'NONE',
              false,
            ],
            [subscription, 'ACTIVE', true],
          ] as const) {
            assert.equal(
              (await call('PATCH', endpoint(), owner, input)).status,
              200,
            );
            await expectState(status, visible);
            assert.equal(
              (await call('GET', '/pharmacist/medicines', pharmacistToken))
                .status,
              200,
            );
            if (status !== 'ACTIVE')
              assert.equal(
                (
                  await call('POST', '/pharmacist/medicines', pharmacistToken, {
                    displayName: 'Blocked',
                    scientificName: 'B',
                    category: 'C',
                    reorderThreshold: 1,
                  })
                ).status,
                403,
              );
          }
        },
      );
      async function snapshot() {
        return {
          pharmacy: await prisma.pharmacy.findUnique({ where: { id } }),
          accounts: await prisma.account.findMany({
            where: { pharmacyId: id },
            orderBy: { id: 'asc' },
          }),
          medicines: await prisma.medicine.findMany({
            where: { pharmacyId: id },
            include: { batches: true },
            orderBy: { id: 'asc' },
          }),
          duty: await prisma.dutyPeriod.findMany({
            where: { pharmacyId: id },
            orderBy: { id: 'asc' },
          }),
        };
      }
      await t.test(
        'deleting subscription preserves all other records and disables writes/listing while allowing reads',
        async () => {
          const before = await snapshot();
          const response = await call('DELETE', endpoint(), owner);
          assert.equal(response.status, 204);
          assert.equal(response.body, null);
          assert.deepEqual(await snapshot(), before);
          await expectState('NONE', false);
          assert.equal(
            (await call('GET', '/pharmacist/medicines', pharmacistToken))
              .status,
            200,
          );
          assert.equal(
            (
              await call('POST', '/pharmacist/medicines', pharmacistToken, {
                displayName: 'Blocked',
                scientificName: 'B',
                category: 'C',
                reorderThreshold: 1,
              })
            ).status,
            403,
          );
          assert.equal((await call('DELETE', endpoint(), owner)).status, 404);
        },
      );
      await t.test(
        'owner-created data persists across an application restart',
        async () => {
          const before = await snapshot();
          await app.close();
          app = await start();
          const response = await call(
            'GET',
            '/owner/pharmacies?q=' +
              encodeURIComponent('Owner Review ' + ownerId) +
              '&status=NONE',
            owner,
          );
          assert.equal(response.status, 200);
          assert.equal(response.body.total, 1);
          assert.deepEqual(await snapshot(), before);
        },
      );
    } finally {
      await app.close();
      await prisma.batch.deleteMany({
        where: { medicine: { pharmacyId: { in: pharmacyIds } } },
      });
      await prisma.medicine.deleteMany({
        where: { pharmacyId: { in: pharmacyIds } },
      });
      await prisma.dutyPeriod.deleteMany({
        where: { pharmacyId: { in: pharmacyIds } },
      });
      await prisma.subscription.deleteMany({
        where: { pharmacyId: { in: pharmacyIds } },
      });
      await prisma.account.deleteMany({
        where: { OR: [{ pharmacyId: { in: pharmacyIds } }, { id: ownerId }] },
      });
      await prisma.pharmacy.deleteMany({ where: { id: { in: pharmacyIds } } });
      await prisma.$disconnect();
    }
  },
);
