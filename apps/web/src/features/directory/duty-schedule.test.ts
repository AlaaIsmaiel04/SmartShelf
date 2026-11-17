import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  filterPublishedDuties,
  publishedDuties,
  SERVICE_AREA,
  SERVICE_TIME_ZONE,
  dutyCalendarDate,
  millisecondsUntilDutyMidnight,
  upcomingDutyDates,
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

test('the duty calendar rolls over at Syria midnight, independently of UTC or the visitor timezone', () => {
  assert.equal(
    dutyCalendarDate(new Date('2026-11-16T20:59:59.999Z')),
    '2026-11-16',
  );
  assert.equal(
    dutyCalendarDate(new Date('2026-11-16T21:00:00Z')),
    '2026-11-17',
  );
  assert.equal(
    millisecondsUntilDutyMidnight(new Date('2026-11-16T20:59:59.999Z')),
    1,
  );
  assert.equal(
    millisecondsUntilDutyMidnight(new Date('2026-11-16T21:00:00Z')),
    86_400_000,
  );
});

test('current listings exclude past duties without deleting the published archive', () => {
  const today = '2026-11-17';
  const dates = upcomingDutyDates(today);
  const entries = filterPublishedDuties('', '', '', today);
  assert.equal(dates[0], today);
  assert.equal(dates.length, 11);
  assert.equal(entries.length, 44);
  assert.ok(entries.every((entry) => entry.date >= today));
  assert.equal(filterPublishedDuties('2026-11-14', '', '', today).length, 0);
  assert.equal(filterPublishedDuties(today, 'نوال', 'noon', today).length, 1);
  assert.equal(publishedDuties.length, 56);
  assert.equal(filterPublishedDuties('2026-11-14', '', '').length, 4);
});

test('the last published day stays visible until Syria midnight and then the schedule is empty', () => {
  assert.deepEqual(upcomingDutyDates('2026-11-27'), ['2026-11-27']);
  assert.equal(filterPublishedDuties('', '', '', '2026-11-27').length, 4);
  assert.deepEqual(upcomingDutyDates('2026-11-28'), []);
  assert.equal(filterPublishedDuties('', '', '', '2026-11-28').length, 0);
  assert.equal(upcomingDutyDates('2026-11-01').length, 14);
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
