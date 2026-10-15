import { expect, it } from 'vitest';
import { coursesConflict } from './time-conflicts.js';

it.each([
  ['MWF 9:00-9:50', 'W 9:30-10:20', true],
  ['M 9:00-12:00', 'M 10:00-11:00', true],
  ['M 9:00-9:50', 'M 9:00-9:50', true],
  ['M 9:00-9:50', 'M 9:50-10:40', false],
  ['M 9:00-9:50', 'M 10:00-10:50', false],
  ['Tu 9:00-10:00', 'Th 9:00-10:00', false],
  ['TuTh 9:00-10:00', 'Th 9:30-10:30', true],
  ['MWF 9:00-10:00', 'TuTh 9:00-10:00', false],
  ['', 'MWF 9:00-10:00', false],
  ['', '', false],
  ['M 0:00-23:59', 'M 23:00-23:59', true],
  ['FMTu 9:00-10:00', 'Tu 9:30-10:30', true],
])('compares %s and %s', (first, second, expected) => {
  const a = { term: 'Fall', meets: first };
  const b = { term: 'Fall', meets: second };
  expect(coursesConflict(a, b)).toBe(expected);
  expect(coursesConflict(b, a)).toBe(expected);
  expect(coursesConflict(a, { ...b, term: 'Winter' })).toBe(false);
});
