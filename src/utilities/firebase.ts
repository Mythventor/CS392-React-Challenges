import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore/lite';
import config from '../firebase-config.json';

// Firebase web configuration is public; Firestore rules control access.
const app = initializeApp(config);
const db = getFirestore(app);

export const loadSchedule = async () => {
  const snapshot = await getDoc(doc(db, 'schedules', 'CS-2018-2019'));
  if (!snapshot.exists()) throw new Error('Schedule not found in Firestore.');
  return snapshot.data();
};
