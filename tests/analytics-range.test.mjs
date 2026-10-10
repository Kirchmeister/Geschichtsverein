import assert from 'node:assert/strict';
import {analyticsRange,analyticsDateLabel,analyticsDay} from '../lib/archive-analytics.ts';
assert.deepEqual(analyticsRange(null,'2026-01-03'),{from:'2025-12-28',to:'2026-01-03'});
assert.equal(analyticsDateLabel('2026-10-10'),'10.10.2026');
assert.equal(analyticsDay(new Date('2026-10-09T22:30:00Z')),'2026-10-10');
assert.deepEqual(analyticsRange('2026-01-01','2026-02-01'),{from:'2026-01-01',to:'2026-02-01'});
console.log('OK: sieben Tage über Jahresgrenze, deutsches Datum, Berliner Tagesgrenze, eigener Zeitraum.');
