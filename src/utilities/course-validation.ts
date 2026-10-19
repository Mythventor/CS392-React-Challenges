export type CourseData = { title: string; term: string; number: string; meets: string };
export type CourseErrors = Partial<Record<keyof CourseData, { type: string; message: string }>>;

const minutes = (hours: string, mins: string) => Number(hours) * 60 + Number(mins);

const meetingError = (value: string): string | undefined => {
  if (value === '') return;
  const match = /^((?:M|Tu|W|Th|F|Sa|Su)+) ([01]?\d|2[0-3]):([0-5]\d)-([01]?\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return 'Use days and start-end times, e.g., MWF 12:00-13:20, or leave empty.';
  const days = match[1].match(/Tu|Th|Sa|Su|M|W|F/g)!;
  if (new Set(days).size !== days.length) return 'List each meeting day only once.';
  if (minutes(match[2], match[3]) >= minutes(match[4], match[5])) {
    return 'The end time must be after the start time.';
  }
};

// Each field in the schema returns a message when its value is invalid.
export const courseSchema: Record<keyof CourseData, (value: string) => string | undefined> = {
  title: (value) => value.trim().length >= 2 ? undefined : 'Enter a title with at least two characters.',
  term: (value) => ['Fall', 'Winter', 'Spring', 'Summer'].includes(value)
    ? undefined : 'Choose Fall, Winter, Spring, or Summer.',
  number: (value) => /^\d+(?:-\d+)?$/.test(value)
    ? undefined : 'Use digits with an optional section, e.g., 213-2.',
  meets: meetingError,
};

// Resolver-style result: valid values, or field-specific errors.
export const validateCourse = (data: CourseData) => {
  const errors: CourseErrors = {};
  for (const field of Object.keys(courseSchema) as (keyof CourseData)[]) {
    const message = typeof data[field] === 'string'
      ? courseSchema[field](data[field]) : 'Enter a text value.';
    if (message) errors[field] = { type: 'validation', message };
  }
  return { values: Object.keys(errors).length ? {} : data, errors };
};
