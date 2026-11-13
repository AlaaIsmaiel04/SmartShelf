import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  filterPublishedDuties,
  publishedDuties,
  SERVICE_AREA,
  SERVICE_TIME_ZONE,
} from './duty-schedule';

test('published notice includes only 14–27 November, four pharmacies per day with two per shift', () => {
  assert.equal(publishedDuties.length, 56);
  assert.equal(SERVICE_AREA, 'سلمية');
  assert.equal(SERVICE_TIME_ZONE, 'Asia/Damascus');
  const dates = [...new Set(publishedDuties.map((entry) => entry.date))];
  assert.equal(dates.length, 14);
  assert.equal(dates[0], '2026-11-14');
  assert.equal(dates.at(-1), '2026-11-27');
  for (const date of dates) {
    assert.equal(filterPublishedDuties(date, '', 'noon').length, 2);
    assert.equal(filterPublishedDuties(date, '', 'evening').length, 2);
  }
  assert.ok(publishedDuties.every((entry) => entry.name && entry.address));
});

test('date, address/name and shift filters combine without losing repeated duty dates', () => {
  assert.deepEqual(filterPublishedDuties('2026-11-14', 'يارا الخطيب', 'noon'), [
    {
      date: '2026-11-14',
      shift: 'noon',
      name: 'يارا الخطيب',
      address: 'شرق قبة تامر',
    },
  ]);
  assert.equal(filterPublishedDuties('', ' فرح عروس ', '').length, 2);
  assert.equal(
    filterPublishedDuties('2026-11-27', 'الحمام', 'noon')[0]?.name,
    'وايت',
  );
  assert.equal(filterPublishedDuties('2026-11-13', '', '').length, 0);
  assert.equal(
    filterPublishedDuties('2026-11-14', 'يارا الخطيب', 'evening').length,
    0,
  );
  assert.equal(filterPublishedDuties('', '', '').length, 56);
});
