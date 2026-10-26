// Requires your Firebase CLI login. Never put administrator credentials in the app.
// Usage: FIREBASE_TOOLS_LIB=/path/to/firebase-tools/lib node scripts/set-admin.cjs email@example.com
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const email = process.argv[2];
  if (!email) throw new Error('Provide the exact administrator email.');
  const cli = process.env.FIREBASE_TOOLS_LIB;
  if (!cli) throw new Error('Set FIREBASE_TOOLS_LIB to the installed firebase-tools/lib directory.');
  const project = JSON.parse(fs.readFileSync(path.join(__dirname, '../.firebaserc'))).projects.default;
  const auth = require(path.join(cli, 'auth'));
  await require(path.join(cli, 'requireAuth')).requireAuth({ project, ...auth.getGlobalDefaultAccount() });
  const { Client } = require(path.join(cli, 'apiv2'));
  const users = new Client({ urlPrefix: 'https://identitytoolkit.googleapis.com', apiVersion: 'v1' });
  const response = await users.post(`/projects/${project}/accounts:lookup`, { email: [email] });
  const user = (response.body.users || []).find((item) => item.email === email);
  if (!user) throw new Error('User not found. Sign into the app once, then run this command again.');
  const firestore = new Client({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1' });
  await firestore.patch(`/projects/${project}/databases/(default)/documents/users/${user.localId}`,
    { fields: { isAdmin: { booleanValue: true } } },
    { queryParams: { 'updateMask.fieldPaths': ['isAdmin'] } });
  console.log('Administrator role assigned to the selected account. Sign out and in to reload permissions.');
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
