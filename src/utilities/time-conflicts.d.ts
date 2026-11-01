type MeetingCourse = { term: string; meets: string };
export function coursesConflict(first: MeetingCourse, second: MeetingCourse): boolean;

export function parseMeeting(meets: string): { days: string[]; start: number; end: number } | null;
