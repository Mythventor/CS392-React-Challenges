import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

const getRoute = () => window.location.hash.slice(1) || '/';

// Hash routes work on Firebase Hosting without additional server rewrites.
export const useRoute = () => useSyncExternalStore(subscribe, getRoute);
