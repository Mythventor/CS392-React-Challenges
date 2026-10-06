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

  return (
  <main className="p-2 font-sans text-gray-900 sm:p-4">
    <h1>{schedule.title}</h1>
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
      {Object.entries(schedule.courses).map(([id, course]) => (
        <li key={id} className="flex min-w-0 flex-col rounded-lg border border-gray-300 bg-white p-5">
          <h2 className="text-xl font-semibold">
            {course.term} CS {course.number}
          </h2>
          <p className="mt-2 mb-5">{course.title}</p>
          <p className="mt-auto border-t border-gray-300 pt-3">
            {course.meets}
          </p>
        </li>
      ))}
    </ul>
  </main>
  );
};

export default App;
