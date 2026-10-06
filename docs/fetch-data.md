# Fetch course data

Replace the hard-coded sample schedule in App.tsx with data from:
https://courses.cs.northwestern.edu/394/guides/data/cs-courses-firestore.php

Use fetch inside useEffect and save the schedule with useState.
The response contains the schedule at data.schedules['CS-2018-2019'].
Show every course for fall, winter, and spring using the existing Tailwind cards.
Display a loading message while waiting and a helpful error message if loading
fails. Cancel the request when the component unmounts.

Check that the live data loads, all courses appear, and build and lint pass.
