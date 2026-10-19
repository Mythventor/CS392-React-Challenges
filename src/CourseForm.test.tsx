import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import CourseForm from './CourseForm';

afterEach(cleanup);
it('shows field errors and clears them when corrected without saving', () => {
  const course = { title: 'AI', term: 'Fall', number: '213-2', meets: '' };
  render(<CourseForm course={course} />);
  for (const [label, invalid, corrected] of [
    ['Course title', 'X', 'AI'], ['Term', 'Autumn', 'Summer'],
    ['Course number', 'CS213', '213-2'], ['Meeting times', 'M 10:00-9:00', 'TuTh 9:00-10:00'],
  ]) {
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value: invalid } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription();
    fireEvent.change(input, { target: { value: corrected } });
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
  }
  expect(fireEvent.submit(screen.getByRole('form'))).toBe(false);
  expect(screen.queryByRole('button', { name: /save|submit/i })).not.toBeInTheDocument();
  expect(course).toEqual({ title: 'AI', term: 'Fall', number: '213-2', meets: '' });
});
