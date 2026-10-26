# Add role-based authorization

Only signed-in administrators can edit and save courses. Everyone else can
still read courses, filter terms, select courses, and view the course plan.

Store each role in users/<Firebase UID> with a boolean isAdmin field. After
sign-in, read the current user's document. Missing profiles and any value other
than boolean true are not administrators. Clear old permissions immediately on
account changes, block editing while roles load, and ignore stale role responses.
If reading a role fails, keep editing blocked and show a helpful message.

Show Edit links only for administrators. Guard direct edit URLs too. If access
is lost, close the form and discard its draft. Firestore must check the same
administrator document for every course update. Users can read only their own
role and cannot create or change role documents through the app.

## Assigning administrators

The selected initial administrator is mengpangxing@gmail.com. Its Firebase
user entry was provisioned with no password; email verification is left to
Google sign-in. No other account is automatically made an administrator.

For additional administrators, sign into the app once using their Google account,
then use your trusted Firebase CLI login to run:

```sh
FIREBASE_TOOLS_LIB=/opt/homebrew/lib/node_modules/firebase-tools/lib node scripts/set-admin.cjs email@example.com
```

Alternatively, use Firebase Console to set isAdmin=true on users/<UID>.
Remove the field or set it to false to revoke access. Database rules enforce
revocation immediately; the UI reloads roles on the next sign-in. Deploy rules
and Hosting together. Never allow clients to assign their own roles.

Test admins, ordinary users, missing profiles, role lookup errors, pending
permissions, account switches, stale responses, and signed-out visitors. Run
build, lint, and tests. Verify the rules compile when deploying.
