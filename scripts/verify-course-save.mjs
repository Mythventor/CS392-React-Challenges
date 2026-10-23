// Optional live smoke test: changes one title and restores it in finally.
import { readFile } from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import { doc, FieldPath, getDoc, getFirestore, updateDoc } from 'firebase/firestore/lite';
const config = JSON.parse(await readFile(new URL('../src/firebase-config.json', import.meta.url)));
const db = getFirestore(initializeApp(config));
const ref = doc(db, 'schedules', 'CS-2018-2019');
const original = (await getDoc(ref)).data();
const id = 'F101';
const course = original.courses[id];
let changed = false;
try {
  await updateDoc(ref, new FieldPath('courses', id), { ...course, title: `${course.title} (save check)` }, new FieldPath('lastEditedCourseId'), id);
  changed = true;
  const saved = (await getDoc(ref)).data();
  if (saved.courses[id].title !== `${course.title} (save check)`) throw new Error('Save verification failed.');
  if (Object.keys(saved.courses).length !== Object.keys(original.courses).length) throw new Error('Course count changed.');
  console.log('Public course update verified; other course IDs preserved.');
} finally {
  if (changed) {
    await updateDoc(ref, new FieldPath('courses', id), course, new FieldPath('lastEditedCourseId'), id);
    const restored = (await getDoc(ref)).data();
    if (JSON.stringify(restored.courses[id]) !== JSON.stringify(course)) throw new Error('Restoration verification failed.');
    console.log('Original course restored and verified.');
  }
}
try {
  await updateDoc(ref, { title: 'Invalid schedule title change' });
  throw new Error('Unexpectedly allowed schedule title change');
} catch (error) {
  if (error.code !== 'permission-denied') throw error;
  console.log('Schedule title changes correctly denied.');
}
