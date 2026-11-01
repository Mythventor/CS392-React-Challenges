import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/firestore/lite', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => 'schedule-reference'),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  FieldPath: class { constructor(..._parts: string[]) { void _parts; } },
}));
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore/lite';
import { loadSchedule, saveCourse, loadAdminRole, loadPlan, savePlan } from './firebase';

beforeEach(() => vi.clearAllMocks());
it('reads the schedule document', async () => {
  const data = { title: 'Test schedule', courses: {} };
  vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => data } as never);
  expect(await loadSchedule()).toEqual(data);
  expect(doc).toHaveBeenCalledWith(expect.anything(), 'schedules', 'CS-2018-2019');
});
it('reports a missing schedule', async () => {
  vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
  await expect(loadSchedule()).rejects.toThrow('Schedule not found');
});
it('propagates connection errors to the app', async () => {
  vi.mocked(getDoc).mockRejectedValue(new Error('Permission denied'));
  await expect(loadSchedule()).rejects.toThrow('Permission denied');
});

it('updates one course without replacing the schedule', async () => {
  const course = { title: 'AI', term: 'Fall', number: '101', meets: '' };
  await saveCourse('F101', course);
  expect(updateDoc).toHaveBeenCalledWith('schedule-reference', expect.anything(), course, expect.anything(), 'F101');
});
it('rejects invalid data before writing', async () => {
  await expect(saveCourse('F101', { title: 'X', term: 'Fall', number: '101', meets: '' })).rejects.toThrow('Invalid course');
  expect(updateDoc).not.toHaveBeenCalled();
});

it.each([true, false, 'true', undefined])('grants editing only for boolean isAdmin=true (%s)', async (role) => {
  vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({ isAdmin: role }) } as never);
  expect(await loadAdminRole('test-user')).toBe(role === true);
  expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user');
});
it('denies editing for a missing profile', async () => {
  vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
  expect(await loadAdminRole('unknown')).toBe(false);
});

it('loads selections from the signed-in user plan path', async () => {
  vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({ selectedCourses: ['F101'] }) } as never);
  expect(await loadPlan('alice')).toEqual(['F101']);
  expect(doc).toHaveBeenCalledWith(expect.anything(), 'plans', 'alice');
});
it('starts with an empty plan for a missing document without writing', async () => {
  vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
  expect(await loadPlan('alice')).toEqual([]);
  expect(setDoc).not.toHaveBeenCalled();
});
it('rejects corrupt saved selections instead of treating them as an empty plan', async () => {
  vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({ selectedCourses: [123] }) } as never);
  await expect(loadPlan('alice')).rejects.toThrow('Invalid saved plan');
});
it('saves only the selected IDs in the owner document', async () => {
  await savePlan('alice', ['F101', 'W101']);
  expect(doc).toHaveBeenCalledWith(expect.anything(), 'plans', 'alice');
  expect(setDoc).toHaveBeenCalledWith('schedule-reference', { selectedCourses: ['F101', 'W101'] });
});
