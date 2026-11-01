import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('./utilities/firebase', () => ({ loadPlan: vi.fn(), savePlan: vi.fn() }));
import { loadPlan, savePlan } from './utilities/firebase';
import useSavedPlan from './useSavedPlan';

const courses = {
  F101: { term: 'Fall', meets: 'MWF 9:00-9:50' },
  F102: { term: 'Fall', meets: 'W 9:30-10:20' },
  W101: { term: 'Winter', meets: 'MWF 9:00-9:50' },
};
beforeEach(() => { vi.mocked(loadPlan).mockResolvedValue([]); vi.mocked(savePlan).mockResolvedValue(undefined); });
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('loads saved selections without writing and prevents initial empty overwrites', async () => {
  let resolve!: (ids: string[]) => void;
  vi.mocked(loadPlan).mockReturnValue(new Promise((done) => { resolve = done; }));
  const { result } = renderHook(() => useSavedPlan('alice', courses));
  expect(result.current.ready).toBe(false);
  act(() => result.current.setSelectedCourses(() => ['W101']));
  expect(savePlan).not.toHaveBeenCalled();
  await act(async () => { resolve(['F101']); });
  expect(result.current.selectedCourses).toEqual(['F101']);
  expect(savePlan).not.toHaveBeenCalled();
});
it('saves additions and removals, including an empty plan', async () => {
  const { result } = renderHook(() => useSavedPlan('alice', courses));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.setSelectedCourses(() => ['F101']));
  await waitFor(() => expect(savePlan).toHaveBeenCalledWith('alice', ['F101']));
  act(() => result.current.setSelectedCourses(() => []));
  await waitFor(() => expect(savePlan).toHaveBeenLastCalledWith('alice', []));
});
it('serializes rapid changes so old writes cannot finish last', async () => {
  let finish!: () => void;
  vi.mocked(savePlan).mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
  const { result } = renderHook(() => useSavedPlan('alice', courses));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.setSelectedCourses(() => ['F101']));
  await waitFor(() => expect(savePlan).toHaveBeenCalledTimes(1));
  act(() => result.current.setSelectedCourses(() => ['F101', 'W101']));
  expect(savePlan).toHaveBeenCalledTimes(1);
  await act(async () => { finish(); });
  await waitFor(() => expect(savePlan).toHaveBeenLastCalledWith('alice', ['F101', 'W101']));
});
it('keeps guests temporary', () => {
  const { result } = renderHook(() => useSavedPlan(null, courses));
  act(() => result.current.setSelectedCourses(() => ['F101']));
  expect(result.current.selectedCourses).toEqual(['F101']);
  expect(loadPlan).not.toHaveBeenCalled();
  expect(savePlan).not.toHaveBeenCalled();
});
it('keeps load failures blocked and allows retry without overwriting', async () => {
  vi.mocked(loadPlan).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(['W101']);
  const { result } = renderHook(() => useSavedPlan('alice', courses));
  await waitFor(() => expect(result.current.error).toBe('load'));
  act(() => result.current.setSelectedCourses(() => []));
  expect(savePlan).not.toHaveBeenCalled();
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.selectedCourses).toEqual(['W101']));
});
it('retains failed changes and retries saving', async () => {
  vi.mocked(savePlan).mockRejectedValueOnce(new Error('offline'));
  const { result } = renderHook(() => useSavedPlan('alice', courses));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.setSelectedCourses(() => ['F101']));
  await waitFor(() => expect(result.current.error).toBe('save'));
  expect(result.current.selectedCourses).toEqual(['F101']);
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe('Plan saved.'));
});
it('removes stale, duplicate, and conflicting IDs from a loaded plan', async () => {
  vi.mocked(loadPlan).mockResolvedValue(['missing', 'F101', 'F101', 'F102', 'W101']);
  const { result } = renderHook(() => useSavedPlan('alice', courses));
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.selectedCourses).toEqual(['F101', 'W101']);
  expect(savePlan).not.toHaveBeenCalled();
});
it('ignores a load that completes after unmounting for an account switch', async () => {
  let finishAlice!: (ids: string[]) => void;
  vi.mocked(loadPlan).mockImplementation((uid) => uid === 'alice'
    ? new Promise((resolve) => { finishAlice = resolve; }) : Promise.resolve(['W101']));
  const first = renderHook(() => useSavedPlan('alice', courses));
  first.unmount();
  const second = renderHook(() => useSavedPlan('bob', courses));
  await waitFor(() => expect(second.result.current.ready).toBe(true));
  await act(async () => { finishAlice(['F101']); });
  expect(second.result.current.selectedCourses).toEqual(['W101']);
  expect(savePlan).not.toHaveBeenCalled();
});
