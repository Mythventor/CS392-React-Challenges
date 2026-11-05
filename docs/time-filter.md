# Filter courses by time

Add Earliest start and Latest end time inputs above the cards. Either can be
blank. Show only courses that fit fully inside the chosen times, including
exact boundary matches. Combine this with the term and search filters.

Reuse the meeting parser and compare times in minutes. Hide courses without
meeting times while filtering. Show an error for reversed limits and a message
for no matches. Add Clear times without clearing the search or selections.

Test boundaries, one-sided limits, empty times, invalid ranges, clearing,
combined filters, and keeping hidden courses selected.

Resources:
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
