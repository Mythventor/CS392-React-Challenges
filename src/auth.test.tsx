import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
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
vi.mock('./utilities/firebase', () => ({ app: {}, loadSchedule: vi.fn(), saveCourse: vi.fn() }));
import { signInWithPopup, signOut } from 'firebase/auth';
import { loadSchedule } from './utilities/firebase';
import { AuthProvider, AuthBanner } from './auth';
import App from './App';

afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('reacts to auth changes, signs in/out, and cleans up its listener', async () => {
  const { unmount } = render(<AuthProvider><AuthBanner /></AuthProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
  await waitFor(() => expect(signInWithPopup).toHaveBeenCalledTimes(1));
  act(() => authMock.listener!({ uid: '123', displayName: 'Student' } as User));
  expect(screen.getByText('Signed in as Student')).toBeInTheDocument();
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
  fireEvent.change(screen.getByLabelText('Course title'), { target: { value: 'Unsaved draft' } });
  act(() => authMock.listener!(null));
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  act(() => authMock.listener!({ uid: '123' } as User));
  expect(screen.getByLabelText('Course title')).toHaveValue('Original title');
  window.history.replaceState(null, '', '#/');
});
