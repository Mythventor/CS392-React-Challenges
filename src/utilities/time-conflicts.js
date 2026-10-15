const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const parseMeeting = (meets) => {
  if (!meets.trim()) return null;
  const [days, times] = meets.trim().split(/\s+/);
  const [start, end] = times.split('-').map(toMinutes);
  return { days: days.match(/Tu|Th|Sa|Su|M|W|F/g) ?? [], start, end };
};

const daysOverlap = (first, second) =>
  first.some((day) => second.includes(day));

const timesOverlap = (first, second) =>
  first.start < second.end && second.start < first.end;

// Meeting strings follow the schedule's "MWF 9:00-9:50" format.
export const coursesConflict = (first, second) => {
  if (first.term !== second.term) return false;
  const firstMeeting = parseMeeting(first.meets);
  const secondMeeting = parseMeeting(second.meets);
  if (!firstMeeting || !secondMeeting) return false;
  return daysOverlap(firstMeeting.days, secondMeeting.days)
    && timesOverlap(firstMeeting, secondMeeting);
};
