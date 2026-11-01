# Save course selections

Store each signed-in user's selected course IDs in plans/<Firebase UID> as a
selectedCourses array. Load their saved plan after sign-in and save changes
when courses are selected or unselected. Returning on another device or after
refresh should load the last saved plan. All signed-in users can save their own
plans, whether or not they are course administrators.

Use the saved plan after sign-in rather than merging guest selections. Guests
can select courses temporarily. Clear local selections when switching accounts
or signing out so another user's plan is never shown or saved under the wrong UID.

Do not save initial empty state. Block selections until the first load succeeds;
on failure, show an error and Retry. Keep local changes on save failure and offer
a save retry. Serialize writes to avoid older requests overwriting newer changes.
Only report success after the write completes. There is no offline write queue;
wait for Plan saved before closing. Simultaneous device edits use last-write-wins.

Remove unavailable, duplicate, or newly conflicting courses from loaded plans
and explain that cleanup. Do not automatically overwrite the remote plan until
the user changes selections. Keep the term filter, course plan, and calendar.

Rules allow users to get and save only their own plan. Validate the document
shape, limit the array to 500 unique IDs, and accept only existing course IDs.
Users cannot list other plans or change user-role documents.

Resources:
- https://firebase.google.com/docs/firestore/manage-data/add-data
- https://firebase.google.com/docs/rules/basics

Test first load, refresh/remount, adding/removing all selections, guest use,
account changes, late responses, rapid changes, failed loads/saves, and retry.
Run build, lint, tests, and deploy Hosting plus Firestore rules.
