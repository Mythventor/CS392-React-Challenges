import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FiCalendar } from 'react-icons/fi';
import { writeFileSync } from 'node:fs';

// Render the React icon once so index.html can use a regular SVG file.
const calendar = renderToStaticMarkup(createElement(FiCalendar, {
  x: 6, y: 6, size: 20, color: '#ffffff',
}));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <title>CS Course Scheduler</title>
  <rect width="32" height="32" rx="7" fill="#4e2a84" />
  ${calendar}
</svg>\n`;

writeFileSync(new URL('../public/calendar.svg', import.meta.url), svg);
