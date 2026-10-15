# Catch time conflicts

Prevent selecting a course that conflicts with any selected course. A conflict
requires the same term, at least one shared meeting day, and overlapping times.
Empty meeting strings never conflict. Back-to-back courses do not overlap.

Put the calculation in a JavaScript utility file with short functions for
parsing meeting strings, converting times to minutes, checking shared days,
and checking time overlap. Export only the course conflict function needed by
the React components. Recognize Tu and Th as separate days, not single letters.

Disable and fade conflicting unselected cards and display "Time conflict".
Recalculate immediately when a course is selected or unselected. Selected cards
must always remain enabled so users can remove them. Also check conflicts in
the state update before adding a selection. Preserve the term filter and plan.

Test overlapping and contained time ranges, matching times, different terms,
different days, Tu versus Th, empty meeting times, back-to-back classes, and
times with single-digit hours. Test that unselecting restores availability.
Run build, lint, and tests.
