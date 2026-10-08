# Implement a term filter

Add Fall, Winter, and Spring buttons above the course cards.
Show Fall courses by default. Clicking a button should immediately show only
courses for that term and highlight the selected button.

Create a TermPage component that stores the selected term with useState and
contains TermSelector and CourseList. Pass the selected term and its update
function to TermSelector. Use .filter() in CourseList to show matching courses.

Keep the existing fetched data and card styles. Switching terms should use the
data already loaded without fetching it again. Make the buttons keyboard
accessible and use aria-pressed to identify the selected button.

Check the default Fall view, switching to Winter and Spring, and switching back
to Fall. Confirm other terms are hidden and run build and lint checks.
