# Show a course plan pop-up

Add a Course plan button on the right of the term selector. Clicking it opens
a pop-up showing all selected courses across terms, including their term,
number, title, and meeting times.

If no courses are selected, explain that users can close the pop-up and click
course cards to select them. Include a Close button. Clicking outside the
content should close it; clicking inside should keep it open.

Use state to control visibility and a CoursePlan component for the pop-up.
Use a native modal dialog for keyboard focus handling, support Escape to close,
and return focus to the Course plan button afterward. Allow long plans to scroll
and keep the pop-up usable on small screens. Closing must preserve selections.

Test the empty message, selected courses from multiple terms, closing with the
button or outside click, and keeping the pop-up open when clicked inside.
Run build, lint, and interaction tests.
