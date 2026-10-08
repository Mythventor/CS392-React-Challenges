import { useEffect, useState } from 'react';

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
  <div role="group" aria-label="Choose a term" className="mb-5 flex flex-wrap gap-2">
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
      {filteredCourses.map(([id, course]) => (
        <li key={id} className="min-w-0">
          <button
            type="button"
            aria-pressed={selectedCourses.includes(id)}
            onClick={() => onToggle(id)}
            className={`flex h-full w-full cursor-pointer flex-col rounded-lg border p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 ${
              selectedCourses.includes(id)
                ? 'border-purple-700 bg-purple-100'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <span className="text-xl font-semibold">
              {course.term} CS {course.number}
              <span aria-hidden="true" className="ml-2 text-purple-700">
                {selectedCourses.includes(id) ? '✓' : ''}
              </span>
            </span>
            <span className="mt-2 mb-5">{course.title}</span>
            <span className="mt-auto w-full border-t border-gray-300 pt-3">
              {course.meets}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

const TermPage = ({ schedule }: { schedule: Schedule }) => {
  const [selectedTerm, setSelectedTerm] = useState<Term>('Fall');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const toggleCourse = (id: string) => {
    setSelectedCourses((previous) =>
      previous.includes(id)
        ? previous.filter((courseId) => courseId !== id)
        : [...previous, id]
    );
  };

  return (
    <main className="p-2 font-sans text-gray-900 sm:p-4">
      <h1>{schedule.title}</h1>
      <TermSelector selectedTerm={selectedTerm} onSelect={setSelectedTerm} />
      <CourseList
        courses={schedule.courses}
        selectedTerm={selectedTerm}
        selectedCourses={selectedCourses}
        onToggle={toggleCourse}
      />
    </main>
  );
};

export default App;
