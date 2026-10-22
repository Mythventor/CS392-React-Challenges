// Run with FIREBASE_TOOLS_LIB pointing to your installed firebase-tools/lib.
// Uses your Firebase CLI login; never puts administrator credentials in the app.
const path = require('node:path');
const fs = require('node:fs');
const project = JSON.parse(fs.readFileSync(path.join(__dirname, '../.firebaserc'))).projects.default;
const cli = process.env.FIREBASE_TOOLS_LIB;
if (!cli) throw new Error('Set FIREBASE_TOOLS_LIB to the installed firebase-tools/lib directory.');
const fieldValue = (value) => typeof value === 'string'
  ? { stringValue: value }
  : { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fieldValue(item)])) } };

(async () => {
  const response = await fetch('https://courses.cs.northwestern.edu/394/guides/data/cs-courses-firestore.php');
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  const schedule = (await response.json()).schedules['CS-2018-2019'];
  if (!schedule?.title || !schedule.courses) throw new Error('Invalid source schedule');
  const auth = require(path.join(cli, 'auth'));
  await require(path.join(cli, 'requireAuth')).requireAuth({ project, ...auth.getGlobalDefaultAccount() });
  const { Client } = require(path.join(cli, 'apiv2'));
  const client = new Client({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1' });
  // createDocument fails with ALREADY_EXISTS instead of overwriting existing data.
  await client.post(`/projects/${project}/databases/(default)/documents/schedules`,
    { fields: fieldValue(schedule).mapValue.fields },
    { queryParams: { documentId: 'CS-2018-2019' } });
  console.log(`Imported ${Object.keys(schedule.courses).length} courses into ${project}.`);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
