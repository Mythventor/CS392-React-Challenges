# Add a Firestore database

Import the provided Firestore schedule JSON into the existing Firebase project
react-challenges-d09f1. Store the title and courses in the document
schedules/CS-2018-2019 in the default Firestore database (us-central1).

Replace the sample-URL fetch with a Firestore document read. Keep the existing
course cards, filters, selections, conflict checks, forms, loading message, and
error handling. This task does not enable saving edits.

The public web configuration is in src/firebase-config.json. It is not an
administrator credential. Rules in firestore.rules allow getting only the
sample schedule document and deny client writes and collection listing.

## Import and deployment

The initial import has been performed with scripts/import-schedule.cjs. It uses
the locally installed Firebase CLI's signed-in account, and fails rather than
overwriting an existing schedule. For a fresh project, run firebase login, then
set FIREBASE_TOOLS_LIB to the installed firebase-tools/lib directory and run:

```sh
node scripts/import-schedule.cjs
```

Source: https://courses.cs.northwestern.edu/394/guides/data/cs-courses-firestore.php

Deploy rules and the built website with:

```sh
npm run build
firebase deploy --only firestore:rules,hosting --project react-challenges-d09f1
```

The existing GitHub workflows deploy Hosting after building; rule changes must
be deployed separately. Check build, lint, tests, and a public unauthenticated
read. Verify the deployed app still displays all terms using Firestore data.
