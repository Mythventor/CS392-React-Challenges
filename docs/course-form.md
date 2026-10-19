# Add a course edit form

Add an Edit link to each course card, separate from the selection button.
Open an edit screen at #/courses/<course-id>/edit, with text inputs for the
course title and meeting times already filled with that course's data.

Use local state for the inputs. Add a Cancel button that returns to the main
course list and discards edits. Keep the selected term and selected courses.
Do not add a Submit button, saving, or validation. The form's onSubmit handler
should only prevent the default submission so Enter does not reload the page.

Edit links must remain available on conflicting courses and must not change
course selections. Support browser Back/Forward and direct edit links, with a
helpful message for an unknown course. Reopening a form should show original data.

Test prefilled inputs, typing, canceled edits, prevented submission, routing,
and preserved selections. Run build, lint, and tests.
