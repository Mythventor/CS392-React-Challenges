import { validateCourse } from './course-validation';
import type { CourseData } from './course-validation';
import { initializeApp } from 'firebase/app';
import { doc, FieldPath, getDoc, getFirestore, updateDoc } from 'firebase/firestore/lite';
import config from '../firebase-config.json';

// Firebase web configuration is public; Firestore rules control access.
export const app = initializeApp(config);
const db = getFirestore(app);

export const loadSchedule = async () => {
  const snapshot = await getDoc(doc(db, 'schedules', 'CS-2018-2019'));
  if (!snapshot.exists()) throw new Error('Schedule not found in Firestore.');
  return snapshot.data();
};

export const saveCourse = async (courseId: string, course: CourseData) => {
  if (Object.keys(validateCourse(course).errors).length) throw new Error('Invalid course data.');
  await updateDoc(doc(db, 'schedules', 'CS-2018-2019'),
    new FieldPath('courses', courseId), course,
    new FieldPath('lastEditedCourseId'), courseId);
};
