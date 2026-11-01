import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPlan, savePlan } from './utilities/firebase';
import { coursesConflict } from './utilities/time-conflicts.js';

type Courses = Record<string, { term: string; meets: string }>;
type Update = (previous: string[]) => string[];

export default function useSavedPlan(uid: string | null, courses: Courses) {
  const [selectedCourses, setSelections] = useState<string[]>([]);
  const [ready, setReady] = useState(!uid);
  const [status, setStatus] = useState(uid ? 'Loading saved plan…' : 'Sign in to save your selections.');
  const [error, setError] = useState<'load' | 'save' | null>(null);
  const selections = useRef<string[]>([]);
  const readyRef = useRef(!uid);
  const active = useRef(true);
  const version = useRef(0);
  const loadRequest = useRef(0);
  const queue = useRef(Promise.resolve());
  const currentCourses = useRef(courses);
  useEffect(() => { currentCourses.current = courses; }, [courses]);

  const readPlan = useCallback(async () => {
    if (!uid) return;
    const request = ++loadRequest.current;
    try {
      const saved = await loadPlan(uid);
      if (!active.current || request !== loadRequest.current) return;
      const valid: string[] = [];
      for (const id of saved) {
        if (Object.hasOwn(currentCourses.current, id) && !valid.includes(id) &&
            !valid.some((other) => coursesConflict(currentCourses.current[id], currentCourses.current[other]))) valid.push(id);
      }
      selections.current = valid;
      setSelections(valid);
      readyRef.current = true;
      setReady(true);
      setError(null);
      setStatus(valid.length === saved.length ? 'Saved plan loaded.' : 'Plan loaded. Removed unavailable or conflicting courses.');
    } catch {
      if (active.current && request === loadRequest.current) {
        setError('load');
        setStatus('Could not load your saved plan. Retry before changing selections.');
      }
    }
  }, [uid]);

  useEffect(() => {
    active.current = true;
    // Initial state already represents loading; readPlan updates state after the database response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void readPlan();
    return () => { active.current = false; };
  }, [readPlan]);

  const persist = (ids: string[]) => {
    if (!uid) return;
    const request = ++version.current;
    setError(null);
    setStatus('Saving plan…');
    // Serialize writes so an older slow request cannot overwrite a later change.
    queue.current = queue.current.then(async () => {
      if (!active.current) return;
      try {
        await savePlan(uid, ids);
        if (active.current && request === version.current) setStatus('Plan saved.');
      } catch {
        if (active.current && request === version.current) {
          setError('save');
          setStatus('Could not save your plan. Your selections are still here. Retry to save them.');
        }
      }
    });
  };

  const setSelectedCourses = (update: Update) => {
    if (!readyRef.current) return;
    const next = update(selections.current);
    if (next.length === selections.current.length && next.every((id, index) => id === selections.current[index])) return;
    selections.current = next;
    setSelections(next);
    persist([...next]);
  };

  return { selectedCourses, setSelectedCourses, ready, status, error,
    retry: () => {
      if (error === 'load') {
        setError(null);
        setStatus('Loading saved plan…');
        void readPlan();
      } else persist([...selections.current]);
    },
  };
}
