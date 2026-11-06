import { getCourseColor } from './utilities/course-colors';
import { parseMeeting } from './utilities/time-conflicts.js';

type CalendarCourse = { id: string; term: string; number: string; title: string; meets: string };
const days = [['M', 'Monday'], ['Tu', 'Tuesday'], ['W', 'Wednesday'], ['Th', 'Thursday'], ['F', 'Friday'], ['Sa', 'Saturday'], ['Su', 'Sunday']];
const pixelsPerMinute = 1.2;
const formatTime = (minutes: number) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;

export default function WeeklyCalendar({ courses, term }: { courses: CalendarCourse[]; term: string }) {
  const selected = courses.filter((course) => course.term === term);
  const timed = selected.flatMap((course) => {
    const meeting = parseMeeting(course.meets);
    return meeting ? [{ course, ...meeting }] : [];
  });
  const unscheduled = selected.filter((course) => !course.meets.trim());
  const showWeekend = timed.some((meeting) => meeting.days.includes('Sa') || meeting.days.includes('Su'));
  const columns = showWeekend ? days : days.slice(0, 5);
  // Keep a useful daytime range, expanding for early and late classes.
  const calendarStart = Math.floor(Math.min(8 * 60, ...timed.map((item) => item.start)) / 60) * 60;
  const calendarEnd = Math.ceil(Math.max(18 * 60, ...timed.map((item) => item.end)) / 60) * 60;
  const height = (calendarEnd - calendarStart) * pixelsPerMinute;
  const hours = Array.from({ length: (calendarEnd - calendarStart) / 60 + 1 }, (_, index) => calendarStart + index * 60);

  return (
    <section aria-label={`${term} weekly calendar`}>
      <h3 className="mb-2 text-lg font-semibold">{term} weekly calendar</h3>
      {selected.length === 0 ? <p>No courses selected for {term}. Close the plan and select course cards to add them.</p> : <>
        <p className="mb-3 text-sm text-gray-600">Times are shown in 24-hour format. Full course details are listed below.</p>
        <div className="overflow-x-auto rounded border border-gray-200" tabIndex={0} aria-label="Weekly calendar; scroll horizontally on smaller screens">
          <div style={{ minWidth: showWeekend ? 980 : 720 }}>
            <div className="grid border-b border-gray-200 bg-gray-50 text-center text-sm font-semibold" style={{ gridTemplateColumns: `64px repeat(${columns.length}, minmax(0, 1fr))` }}>
              <div className="p-2">Time</div>
              {columns.map(([day, label]) => <div key={day} className="border-l border-gray-200 p-2">{label}</div>)}
            </div>
            <div className="grid pt-3 pb-3" style={{ gridTemplateColumns: `64px repeat(${columns.length}, minmax(0, 1fr))` }}>
              <div className="relative text-right text-xs text-gray-600" style={{ height }}>
                {hours.map((minutes) => <span key={minutes} className="absolute right-2 -translate-y-1/2" style={{ top: (minutes - calendarStart) * pixelsPerMinute }}>{formatTime(minutes)}</span>)}
              </div>
              {columns.map(([day, label]) => (
                <div key={day} aria-label={`${label} classes`} className="relative border-l border-gray-200" style={{ height, backgroundImage: 'repeating-linear-gradient(to bottom, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 72px)' }}>
                  {timed.filter((meeting) => meeting.days.includes(day)).map(({ course, start, end }) => (
                    <div key={course.id} tabIndex={0}
                      aria-label={`CS ${course.number}: ${course.title}, ${label} ${formatTime(start)}-${formatTime(end)}`}
                      title={`CS ${course.number}: ${course.title}\n${course.meets}`}
                      className="absolute right-1 left-1 overflow-hidden rounded border px-2 text-xs focus-visible:outline-2 focus-visible:outline-purple-700"
                      style={{ backgroundColor: getCourseColor(course.id).background, borderColor: getCourseColor(course.id).border, color: getCourseColor(course.id).text, top: (start - calendarStart) * pixelsPerMinute, height: (end - start) * pixelsPerMinute }}>
                      <strong className="block">CS {course.number}</strong>
                      <span className="block truncate">{course.title}</span>
                      <span className="block">{formatTime(start)}–{formatTime(end)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        {unscheduled.length > 0 && <div className="mt-4">
          <h4 className="font-semibold">No meeting time</h4>
          {unscheduled.map((course) => <p key={course.id} className="mt-2 border-l-4 pl-2" style={{ borderColor: getCourseColor(course.id).border }}>CS {course.number}: {course.title}</p>)}
        </div>}
      </>}
    </section>
  );
}
