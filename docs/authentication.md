# Add authentication

Use Firebase Google authentication. Track the current user with
onAuthStateChanged and unsubscribe when the provider unmounts. Show a banner on
all screens with Google sign-in or sign-out and the signed-in user's name.
Show useful errors if authentication fails.

Anyone can read, filter, and select courses. Only signed-in users can see Edit
links, open the edit form, or save. Guard direct edit URLs while authentication
loads and when signed out. Signing out closes the edit form and discards its
local draft. Require request.auth != null in addition to existing update checks
in Firestore rules. All signed-in users can edit; roles are a later task.

## Firebase setup

Google sign-in has been enabled for this project with the public name
CS Course Scheduler. The following steps describe how to reproduce the setup.

In the Firebase console for react-challenges-d09f1, open Authentication, click
Get started if needed, and enable Google under Sign-in method. Choose the
project support email and save. Confirm authorized domains include
react-challenges-d09f1.web.app, react-challenges-d09f1.firebaseapp.com and
localhost if using local development. No provider client secret belongs in the
repository.

Publish with:

```sh
npm run build
firebase deploy --only firestore:rules,hosting --project react-challenges-d09f1
```

Test public browsing, hidden Edit links, direct edit guards, sign-in/sign-out,
failed sign-in, and draft disposal after sign-out. Verify Google sign-in in a
browser after enabling the provider. Run build, lint, and tests.
