import { expect, it } from 'vitest';
import { invalidTimeRange, matchesTimeWindow } from './time-filter';

it.each([
  ['MWF 9:00-9:50', '09:00', '09:50', true],
  ['MWF 9:00-9:50', '09:01', '', false],
  ['MWF 9:00-9:50', '', '09:49', false],
  ['MWF 9:00-9:50', '', '10:00', true],
  ['MWF 9:00-9:50', '08:00', '', true],
  ['MWF 9:00-9:50', '10:00', '08:00', false],
  ['M 0:00-0:50', '00:00', '00:50', true],
  ['Th 23:00-23:59', '23:00', '23:59', true],
  ['', '', '', true],
  ['', '09:00', '', false],
  ['', '', '12:00', false],
])('filters %s in %s–%s', (meets, earliest, latest, expected) => {
  expect(matchesTimeWindow(meets, earliest, latest)).toBe(expected);
});
it('validates only reversed bounded ranges', () => {
  expect(invalidTimeRange('10:00', '09:00')).toBe(true);
  expect(invalidTimeRange('09:00', '10:00')).toBe(false);
  expect(invalidTimeRange('09:00', '09:00')).toBe(false);
  expect(invalidTimeRange('09:00', '')).toBe(false);
});
