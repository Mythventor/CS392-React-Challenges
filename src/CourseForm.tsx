import { useState } from 'react';

type CourseFormProps = {
  course: { term: string; number: string; title: string; meets: string };
};

export default function CourseForm({ course }: CourseFormProps) {
  const [title, setTitle] = useState(course.title);
  const [meets, setMeets] = useState(course.meets);

  return (
    <main className="mx-auto max-w-xl p-4 font-sans text-gray-900">
      <h1>Edit {course.term} CS {course.number}</h1>
      <form aria-label="Edit course" onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2" htmlFor="course-title">
          Course title
          <input id="course-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} className="rounded border border-gray-400 p-3" />
        </label>
        <label className="flex flex-col gap-2" htmlFor="course-meets">
          Meeting times
          <input id="course-meets" type="text" value={meets} onChange={(event) => setMeets(event.target.value)} className="rounded border border-gray-400 p-3" />
        </label>
        <button type="button" onClick={() => { window.location.hash = '/'; }} className="self-start rounded bg-gray-100 px-4 py-2 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-purple-700">
          Cancel
        </button>
      </form>
    </main>
  );
}
