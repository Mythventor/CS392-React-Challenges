# Add form submission

Add a Submit button to the course edit form. Use the existing Firestore database.
Save only if the fields are valid, at least one value changed, and no save is
already in progress. Enforce these checks in both the button and submit handler.
Show Saving while pending, prevent duplicate saves, and show a helpful error
while keeping the draft if the write fails. Cancel discards changes.

Update only courses/<course-id> in schedules/CS-2018-2019 using updateDoc and
FieldPath; do not replace the entire schedule. After success, update local data
and return to the list. If an edited selected course now conflicts, remove that
course from the plan so selected courses remain conflict-free.

Public edits are intentional for this classroom demo, as requested by the user.
Firestore rules limit updates to one existing course and basic field formats;
clients cannot create or delete the schedule or change its title or course IDs.
The form also validates duplicate days and start/end ordering.

Deploy both firestore.rules and Hosting when publishing. Test invalid and
unchanged data, valid writes, duplicate submission, errors/retry, and local card
updates. Run build, lint, and the test suite.
