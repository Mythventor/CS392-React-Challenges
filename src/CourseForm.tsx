import { useState } from 'react';
import { validateCourse } from './utilities/course-validation';
import type { CourseData } from './utilities/course-validation';

const fields = [
  ['title', 'Course title'],
  ['term', 'Term'],
  ['number', 'Course number'],
  ['meets', 'Meeting times'],
] as const;

export default function CourseForm({ course }: { course: CourseData }) {
  const [draft, setDraft] = useState({ ...course });
  const { errors } = validateCourse(draft);

  return (
    <main className="mx-auto max-w-xl p-4 font-sans text-gray-900">
      <h1>Edit {course.term} CS {course.number}</h1>
      <form aria-label="Edit course" noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        {fields.map(([field, label]) => (
          <div key={field} className="flex flex-col gap-2">
            <label htmlFor={`course-${field}`}>{label}</label>
            <input
              id={`course-${field}`}
              type="text"
              value={draft[field]}
              onChange={(event) => setDraft((previous) => ({ ...previous, [field]: event.target.value }))}
              aria-invalid={Boolean(errors[field])}
              aria-describedby={errors[field] ? `${field}-error` : undefined}
              className={`rounded border p-3 ${errors[field] ? 'border-red-700' : 'border-gray-400'}`}
            />
            {errors[field] && <p id={`${field}-error`} className="text-red-700" aria-live="polite">{errors[field].message}</p>}
          </div>
        ))}
        <button type="button" onClick={() => { window.location.hash = '/'; }} className="self-start rounded bg-gray-100 px-4 py-2 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-purple-700">
          Cancel
        </button>
      </form>
    </main>
  );
}
