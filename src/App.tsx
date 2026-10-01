const schedules = {
  'CS-2018-2019': {
    title: 'CS Courses for 2018-2019',
    courses: {
      F101: {
        term: 'Fall',
        number: '101',
        meets: 'MWF 11:00-11:50',
        title: 'Computer Science: Concepts, Philosophy, and Connections',
      },
      F110: {
        term: 'Fall',
        number: '110',
        meets: 'MWF 10:00-10:50',
        title: 'Intro Programming for non-majors',
      },
      S313: {
        term: 'Spring',
        number: '313',
        meets: 'TuTh 15:30-16:50',
        title: 'Tangible Interaction Design and Learning',
      },
      S314: {
        term: 'Spring',
        number: '314',
        meets: 'TuTh 9:30-10:50',
        title: 'Tech & Human Interaction',
      },
    },
  },
};

const schedule = schedules['CS-2018-2019'];

const App = () => (
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

export default App;
