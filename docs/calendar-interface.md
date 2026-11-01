# Add a calendar interface

Add a weekly calendar inside the Course plan pop-up for selected courses in the
currently selected term. Keep all selected course details below the calendar.

Use day columns and 24-hour time labels. Show a block on every meeting day with
the course number, title, and time. Convert meeting times to minutes, then use
top = (start - calendarStart) * pixelsPerMinute and
height = (end - start) * pixelsPerMinute to position blocks within each day.
Reuse the meeting parser from the conflict utility.

Use an 08:00–18:00 range that expands to include earlier or later classes. Show
weekend columns if needed. Keep block height proportional to duration, and
provide full details in accessible labels, hover text, and the list below when
a short block cannot fit the title. List courses without meeting times below
the calendar. Show instructions if no courses are selected for the current term.

Allow horizontal scrolling on phones and expand the pop-up width. Preserve
selection, conflict checks, and close button/outside click/Escape behavior.

Resources:
- https://tailwindcss.com/docs/grid-template-columns
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning

Test term filtering, every meeting day, block position and duration, early/late
and weekend classes, empty meetings, and empty selections. Run build, lint,
and tests. Use code/CLI tools without controlling the user's screen.
