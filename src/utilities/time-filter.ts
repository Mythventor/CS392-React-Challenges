import { parseMeeting } from './time-conflicts.js';

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const invalidTimeRange = (earliest: string, latest: string) =>
  Boolean(earliest && latest && toMinutes(earliest) > toMinutes(latest));

export const matchesTimeWindow = (meets: string, earliest: string, latest: string) => {
  if (!earliest && !latest) return true;
  if (invalidTimeRange(earliest, latest)) return false;
  const meeting = parseMeeting(meets);
  return Boolean(meeting &&
    (!earliest || meeting.start >= toMinutes(earliest)) &&
    (!latest || meeting.end <= toMinutes(latest)));
};
