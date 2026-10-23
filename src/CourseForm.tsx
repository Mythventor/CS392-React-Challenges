import { useRef, useState } from 'react';
import { validateCourse } from './utilities/course-validation';
import type { CourseData } from './utilities/course-validation';

const fields = [
  ['title', 'Course title'],
  ['term', 'Term'],
  ['number', 'Course number'],
  ['meets', 'Meeting times'],
] as const;

export default function CourseForm({ course, onSave }: { course: CourseData; onSave: (draft: CourseData) => Promise<void> }) {
  const [draft, setDraft] = useState({ ...course });
  const { errors } = validateCourse(draft);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const hasChanges = fields.some(([field]) => draft[field] !== course[field]);
  const canSubmit = hasChanges && Object.keys(errors).length === 0 && !isSaving;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(draft);
      window.location.hash = '/';
    } catch {
      setSaveError('Could not save changes. Please try again.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-4 font-sans text-gray-900">
      <h1>Edit {course.term} CS {course.number}</h1>
      <form aria-label="Edit course" noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {fields.map(([field, label]) => (
          <div key={field} className="flex flex-col gap-2">
            <label htmlFor={`course-${field}`}>{label}</label>
            <input
              id={`course-${field}`}
              type="text"
              disabled={isSaving}
              value={draft[field]}
              onChange={(event) => setDraft((previous) => ({ ...previous, [field]: event.target.value }))}
              aria-invalid={Boolean(errors[field])}
              aria-describedby={errors[field] ? `${field}-error` : undefined}
              className={`rounded border p-3 ${errors[field] ? 'border-red-700' : 'border-gray-400'}`}
            />
            {errors[field] && <p id={`${field}-error`} className="text-red-700" aria-live="polite">{errors[field].message}</p>}
          </div>
        ))}
        {saveError && <p role="alert" className="text-red-700">{saveError}</p>}
        <button type="submit" disabled={!canSubmit} className="self-start rounded bg-purple-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40">
          {isSaving ? 'Saving…' : 'Submit'}
        </button>
        <button disabled={isSaving} type="button" onClick={() => { window.location.hash = '/'; }} className="self-start rounded bg-gray-100 px-4 py-2 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-purple-700">
          Cancel
        </button>
      </form>
    </main>
  );
}
