import { useEffect, useRef, useState } from 'react';
import { coursesConflict } from './utilities/time-conflicts.js';

type Course = {
  term: string;
  number: string;
  title: string;
  meets: string;
};

type Schedule = {
  title: string;
  courses: Record<string, Course>;
};

const scheduleUrl =
  'https://courses.cs.northwestern.edu/394/guides/data/cs-courses-firestore.php';

const App = () => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSchedule = async () => {
      try {
        const response = await fetch(scheduleUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Could not load courses (HTTP ${response.status}).`);
        }

        const data = await response.json();
        const loadedSchedule = data.schedules?.['CS-2018-2019'];
        if (!loadedSchedule || typeof loadedSchedule.title !== 'string' ||
            !loadedSchedule.courses || typeof loadedSchedule.courses !== 'object' ||
            Array.isArray(loadedSchedule.courses) ||
            !Object.values(loadedSchedule.courses).every((course) =>
              course !== null && typeof course === 'object' &&
              ['term', 'number', 'title', 'meets'].every((field) =>
                typeof (course as Record<string, unknown>)[field] === 'string'))) {
          throw new Error('The schedule data is not in the expected format.');
        }

        if (!controller.signal.aborted) setSchedule(loadedSchedule);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : 'Could not load courses.');
        }
      }
    };

    void loadSchedule();
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <main className="p-2 font-sans text-gray-900 sm:p-4">
        <h1>CS Course Scheduler</h1>
        <p role="alert">{error} Please refresh the page to try again.</p>
      </main>
    );
  }

  if (!schedule) {
    return (
      <main className="p-2 font-sans text-gray-900 sm:p-4">
        <h1>CS Course Scheduler</h1>
        <p role="status">Loading courses…</p>
      </main>
    );
  }

  return <TermPage schedule={schedule} />;
};

const terms = ['Fall', 'Winter', 'Spring'] as const;
type Term = typeof terms[number];

const TermSelector = ({ selectedTerm, onSelect }: {
  selectedTerm: Term;
  onSelect: (term: Term) => void;
}) => (
  <div role="group" aria-label="Choose a term" className="flex flex-wrap gap-2">
    {terms.map((term) => (
      <button
        key={term}
        type="button"
        aria-pressed={selectedTerm === term}
        onClick={() => onSelect(term)}
        className={`cursor-pointer rounded px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 ${
          selectedTerm === term
            ? 'bg-purple-700 text-white'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {term}
      </button>
    ))}
  </div>
);

const CourseList = ({ courses, selectedTerm, selectedCourses, onToggle }: {
  courses: Record<string, Course>;
  selectedTerm: Term;
  selectedCourses: string[];
  onToggle: (id: string) => void;
}) => {
  const filteredCourses = Object.entries(courses)
    .filter(([, course]) => course.term === selectedTerm);

  if (filteredCourses.length === 0) {
    return <p>No courses available for {selectedTerm}.</p>;
  }

  return (
    <ul aria-label={`${selectedTerm} courses`} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
      {filteredCourses.map(([id, course]) => {
        const isSelected = selectedCourses.includes(id);
        const isBlocked = !isSelected && selectedCourses.some((selectedId) =>
          coursesConflict(course, courses[selectedId]));
        return (
        <li key={id} className="min-w-0">
          <button
            type="button"
            aria-pressed={isSelected}
            disabled={isBlocked}
            onClick={() => onToggle(id)}
            className={`flex h-full w-full cursor-pointer flex-col rounded-lg border p-5 text-left disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 ${
              isSelected
                ? 'border-purple-700 bg-purple-100'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <span className="text-xl font-semibold">
              {course.term} CS {course.number}
              <span aria-hidden="true" className="ml-2 text-purple-700">
                {isSelected ? '✓' : ''}
              </span>
            </span>
            <span className="mt-2 mb-5">{course.title}</span>
            {isBlocked && <span className="mb-2 font-semibold">Time conflict</span>}
            <span className="mt-auto w-full border-t border-gray-300 pt-3">
              {course.meets}
            </span>
          </button>
        </li>
        );
      })}
    </ul>
  );
};

const CoursePlan = ({ courses, selectedCourses, onClose }: {
  courses: Record<string, Course>;
  selectedCourses: string[];
  onClose: () => void;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="course-plan-title"
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-4 backdrop:bg-black/50 open:flex open:items-center open:justify-center"
    >
      <section className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 font-sans text-gray-900 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="course-plan-title" className="text-2xl font-semibold">Course plan</h2>
          <button type="button" onClick={onClose} className="cursor-pointer rounded bg-gray-100 px-4 py-2 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-purple-700">
            Close
          </button>
        </div>
        {selectedCourses.length === 0 ? (
          <p>No courses selected. Close this window and click a course card to select it.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {selectedCourses.map((id) => {
              const course = courses[id];
              return (
                <li key={id} className="py-3">
                  <h3 className="font-semibold">{course.term} CS {course.number}</h3>
                  <p>{course.title}</p>
                  <p className="mt-1 text-gray-600">{course.meets}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </dialog>
  );
};

const TermPage = ({ schedule }: { schedule: Schedule }) => {
  const [selectedTerm, setSelectedTerm] = useState<Term>('Fall');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  const toggleCourse = (id: string) => {
    setSelectedCourses((previous) => {
      if (previous.includes(id)) return previous.filter((courseId) => courseId !== id);
      if (previous.some((selectedId) =>
        coursesConflict(schedule.courses[id], schedule.courses[selectedId]))) return previous;
      return [...previous, id];
    });
  };

  return (
    <main className="p-2 font-sans text-gray-900 sm:p-4">
      <h1>{schedule.title}</h1>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <TermSelector selectedTerm={selectedTerm} onSelect={setSelectedTerm} />
        <button type="button" aria-haspopup="dialog" onClick={() => setIsPlanOpen(true)} className="cursor-pointer rounded bg-purple-700 px-4 py-2 font-medium text-white hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700">
          Course plan
        </button>
      </div>
      <CourseList
        courses={schedule.courses}
        selectedTerm={selectedTerm}
        selectedCourses={selectedCourses}
        onToggle={toggleCourse}
      />
      {isPlanOpen && (
        <CoursePlan courses={schedule.courses} selectedCourses={selectedCourses} onClose={() => setIsPlanOpen(false)} />
      )}
    </main>
  );
};

export default App;
