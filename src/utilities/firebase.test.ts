import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/firestore/lite', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => 'schedule-reference'),
  getDoc: vi.fn(),
}));
import { doc, getDoc } from 'firebase/firestore/lite';
import { loadSchedule } from './firebase';

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
