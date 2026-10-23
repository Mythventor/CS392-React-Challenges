import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { app } from './utilities/firebase';

const auth = getAuth(app);
type AuthState = {
  user: User | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
};
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
  }, () => {
    setUser(null);
    setLoading(false);
    setError('Could not check sign-in. Please refresh and try again.');
  }), []);

  const runAuth = async (action: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setError(null);
    try { await action(); }
    catch { setError(message); }
    finally { setBusy(false); }
  };

  return <AuthContext.Provider value={{ user, loading, busy, error,
    signIn: () => runAuth(() => signInWithPopup(auth, new GoogleAuthProvider()), 'Could not sign in. Allow the Google sign-in pop-up and try again.'),
    logOut: () => runAuth(() => signOut(auth), 'Could not sign out. Please try again.'),
  }}>{children}</AuthContext.Provider>;
}

// These exports intentionally share the provider's context.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const state = useContext(AuthContext);
  if (!state) throw new Error('AuthProvider is required');
  return state;
}

export function AuthBanner() {
  const { user, loading, busy, error, signIn, logOut } = useAuth();
  return (
    <header className="border-b border-gray-200 bg-gray-50 p-4 font-sans text-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a href="#/" className="font-semibold text-purple-800">CS Course Scheduler</a>
        <div className="flex flex-wrap items-center gap-3">
          {loading ? <span>Checking sign-in…</span> : <>
            {user && <span>Signed in as {user.displayName || user.email || 'user'}</span>}
            <button type="button" disabled={busy} onClick={user ? logOut : signIn} className="rounded bg-purple-700 px-4 py-2 text-white disabled:opacity-40">
              {busy ? 'Please wait…' : user ? 'Sign out' : 'Sign in with Google'}
            </button>
          </>}
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
    </header>
  );
}
