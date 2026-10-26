import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
const authMock = vi.hoisted(() => ({ listener: null as null | ((user: User | null) => void), unsubscribe: vi.fn() }));
vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  GoogleAuthProvider: class {},
  onAuthStateChanged: vi.fn((_auth, listener) => {
    authMock.listener = listener;
    listener(null);
    return authMock.unsubscribe;
  }),
  signInWithPopup: vi.fn().mockResolvedValue({}),
  signOut: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./utilities/firebase', () => ({ app: {}, loadAdminRole: vi.fn().mockResolvedValue(true), loadSchedule: vi.fn(), saveCourse: vi.fn() }));
import { signInWithPopup, signOut } from 'firebase/auth';
import { loadSchedule, loadAdminRole } from './utilities/firebase';
import { AuthProvider, AuthBanner } from './auth';
import App from './App';

beforeEach(() => { vi.mocked(loadAdminRole).mockResolvedValue(true); });

afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('reacts to auth changes, signs in/out, and cleans up its listener', async () => {
  const { unmount } = render(<AuthProvider><AuthBanner /></AuthProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
  await waitFor(() => expect(signInWithPopup).toHaveBeenCalledTimes(1));
  act(() => authMock.listener!({ uid: '123', displayName: 'Student' } as User));
  expect(await screen.findByText('Signed in as Student · Administrator')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
  act(() => authMock.listener!(null));
  expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
  unmount();
  expect(authMock.unsubscribe).toHaveBeenCalled();
});
it('shows a recoverable sign-in error', async () => {
  vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error('popup blocked'));
  render(<AuthProvider><AuthBanner /></AuthProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not sign in');
});
it('guards direct edit URLs and discards the draft on sign-out', async () => {
  vi.mocked(loadSchedule).mockResolvedValue({ title: 'Courses', courses: {
    F101: { title: 'Original title', term: 'Fall', number: '101', meets: '' },
  } });
  window.history.replaceState(null, '', '#/courses/F101/edit');
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Sign in to edit courses' })).toBeInTheDocument();
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  act(() => authMock.listener!({ uid: '123' } as User));
  fireEvent.change(await screen.findByLabelText('Course title'), { target: { value: 'Unsaved draft' } });
  act(() => authMock.listener!(null));
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  act(() => authMock.listener!({ uid: '123' } as User));
  expect(await screen.findByLabelText('Course title')).toHaveValue('Original title');
  window.history.replaceState(null, '', '#/');
});

it('blocks signed-in users without an administrator role, including direct URLs', async () => {
  vi.mocked(loadAdminRole).mockResolvedValue(false);
  vi.mocked(loadSchedule).mockResolvedValue({ title: 'Courses', courses: {
    F101: { title: 'Public course', term: 'Fall', number: '101', meets: '' },
  } });
  window.history.replaceState(null, '', '#/courses/F101/edit');
  render(<App />);
  act(() => authMock.listener!({ uid: 'regular-user' } as User));
  expect(await screen.findByRole('heading', { name: 'Administrator access required' })).toBeInTheDocument();
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Return to courses' }));
  expect(await screen.findByRole('button', { name: /Public course/ })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Edit/ })).not.toBeInTheDocument();
});

it('keeps editing blocked while checking roles and on lookup failure', async () => {
  let rejectRole!: (error: Error) => void;
  vi.mocked(loadAdminRole).mockReturnValue(new Promise<boolean>((_, reject) => { rejectRole = reject; }));
  vi.mocked(loadSchedule).mockResolvedValue({ title: 'Courses', courses: {} });
  window.history.replaceState(null, '', '#/courses/F101/edit');
  render(<App />);
  act(() => authMock.listener!({ uid: 'user' } as User));
  expect(await screen.findByText('Checking editing permissions…')).toBeInTheDocument();
  await act(async () => { rejectRole(new Error('offline')); });
  expect(screen.getByRole('alert')).toHaveTextContent('Could not check editing permissions');
  expect(screen.getByRole('heading', { name: 'Administrator access required' })).toBeInTheDocument();
  window.history.replaceState(null, '', '#/');
});

it('ignores a stale administrator response after switching accounts', async () => {
  let resolveFirst!: (admin: boolean) => void;
  vi.mocked(loadAdminRole).mockImplementation((uid) => uid === 'admin'
    ? new Promise<boolean>((resolve) => { resolveFirst = resolve; }) : Promise.resolve(false));
  render(<AuthProvider><AuthBanner /></AuthProvider>);
  act(() => authMock.listener!({ uid: 'admin', displayName: 'First' } as User));
  act(() => authMock.listener!({ uid: 'regular', displayName: 'Second' } as User));
  expect(await screen.findByText('Signed in as Second · View only')).toBeInTheDocument();
  await act(async () => { resolveFirst(true); });
  expect(screen.getByText('Signed in as Second · View only')).toBeInTheDocument();
});
