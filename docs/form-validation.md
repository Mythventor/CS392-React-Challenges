# Add form validation

Define a typed course schema and a reusable validator with a resolver-style
result containing values and field errors. Connect it to the edit form.

- A title must contain at least two characters after trimming outer spaces.
- Term must be exactly Fall, Winter, Spring, or Summer.
- Course number must be a string of digits, optionally followed by a hyphen
  and section digits, such as 213-2.
- Meeting times may be the empty string. Otherwise require one or more valid,
  non-repeated days and a start-end time, e.g., TuTh 9:00-10:20. Accept hours
  from 0 to 23 and minutes from 00 to 59. End must be later than start.

Include editable fields for all four values. Show clear errors next to invalid
fields and update them as the user types. Associate messages with inputs using
aria-describedby and mark invalid inputs with aria-invalid. Keep edits local,
Cancel discarding changes, and submission prevented; do not add saving yet.

Test every rule, time boundaries, duplicate days, empty times, and messages
appearing and clearing when corrected. Run build, lint, and tests.
