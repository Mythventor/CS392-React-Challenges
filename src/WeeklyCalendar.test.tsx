import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import WeeklyCalendar from './WeeklyCalendar';

afterEach(cleanup);
const course = { id: 'F101', term: 'Fall', number: '101', title: 'Intro course', meets: 'MWF 9:00-9:50' };
it('places blocks on each meeting day at proportional positions and heights', () => {
  render(<WeeklyCalendar courses={[course, { ...course, id: 'W101', term: 'Winter', title: 'Other term' }]} term="Fall" />);
  for (const day of ['Monday', 'Wednesday', 'Friday']) {
    expect(screen.getByLabelText(`CS 101: Intro course, ${day} 9:00-9:50`)).toHaveStyle({ top: '72px', height: '60px' });
  }
  expect(screen.queryByLabelText(/CS 101.*Tuesday/)).not.toBeInTheDocument();
  expect(screen.queryByText('Other term')).not.toBeInTheDocument();
});
it('recognizes Tuesday and Thursday and lists courses without a meeting time', () => {
  render(<WeeklyCalendar courses={[{ ...course, meets: 'TuTh 10:00-11:20' }, { ...course, id: 'F102', number: '102', title: 'Independent study', meets: '' }]} term="Fall" />);
  expect(screen.getByLabelText('CS 101: Intro course, Tuesday 10:00-11:20')).toHaveStyle({ top: '144px', height: '96px' });
  expect(screen.getByLabelText('CS 101: Intro course, Thursday 10:00-11:20')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'No meeting time' })).toBeInTheDocument();
  expect(screen.getByText('CS 102: Independent study')).toBeInTheDocument();
});
it('expands to include early, late, and weekend classes', () => {
  render(<WeeklyCalendar courses={[{ ...course, meets: 'Sa 0:00-0:01' }, { ...course, id: 'F103', number: '103', meets: 'Su 23:00-23:59' }]} term="Fall" />);
  expect(screen.getByLabelText('CS 101: Intro course, Saturday 0:00-0:01')).toHaveStyle({ top: '0px', height: '1.2px' });
  expect(screen.getByLabelText('CS 103: Intro course, Sunday 23:00-23:59')).toHaveStyle({ top: '1656px', height: '70.8px' });
  expect(screen.getByText('24:00')).toBeInTheDocument();
});
it('shows instructions when the current term has no selections', () => {
  render(<WeeklyCalendar courses={[course]} term="Spring" />);
  expect(screen.getByText(/No courses selected for Spring/)).toBeInTheDocument();
  expect(screen.queryByText('Intro course')).not.toBeInTheDocument();
});
