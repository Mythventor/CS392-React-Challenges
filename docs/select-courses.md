# Select courses

Make each course card clickable. Clicking an unselected course selects it;
clicking it again removes the selection. Allow any number of selected courses.

Store selected course IDs in state in TermPage. Pass the selected IDs and a
toggle function to CourseList. Use a new array when adding or removing an ID.
Keep selections when switching between Fall, Winter, and Spring.

Highlight selected cards with a purple background and border and a visible
checkmark. Keep the existing course details and responsive card layout.
Use real buttons so cards work with a mouse, Enter, or Space, and use
aria-pressed to indicate selection. Selections only need to last until refresh.

Check selecting multiple courses, unselecting one without changing the others,
and switching terms and back. Run the build, lint, and interaction tests.
