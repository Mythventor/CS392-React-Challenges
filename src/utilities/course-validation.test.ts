import { expect, it } from 'vitest';
import { validateCourse } from './course-validation';

const valid = { title: 'AI', term: 'Fall', number: '213-2', meets: 'TuTh 9:00-10:20' };
it.each(['Fall', 'Winter', 'Spring', 'Summer'])('accepts %s', (term) => {
  const data = { ...valid, term };
  expect(validateCourse(data)).toEqual({ values: data, errors: {} });
});
it.each(['', 'MWF 0:00-23:59', 'ThTuM 09:00-10:00', 'SaSu 12:00-13:00'])('accepts meeting %s', (meets) => {
  expect(validateCourse({ ...valid, meets }).errors).toEqual({});
});
it.each([' ', 'M 24:00-25:00', 'M 9:60-10:00', 'M 10:00-9:00', 'M 9:00-9:00', 'MM 9:00-10:00', 'TuTu 9:00-10:00', 'T 9:00-10:00', '9:00-10:00', 'MWF', 'M 9:0-10:00'])('rejects meeting %s', (meets) => {
  expect(validateCourse({ ...valid, meets }).errors.meets).toBeDefined();
});
it.each([
  ['title', 'X'], ['title', '  '], ['title', ' X '],
  ['term', 'fall'], ['term', 'Autumn'],
  ['number', '213-'], ['number', 'CS213'], ['number', '213-2-1'], ['number', ''],
] as const)('rejects invalid %s: %s', (field, value) => {
  const result = validateCourse({ ...valid, [field]: value });
  expect(result.errors[field]).toBeDefined();
  expect(result.values).toEqual({});
});
