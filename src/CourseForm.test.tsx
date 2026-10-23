import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CourseForm from './CourseForm';

afterEach(cleanup);
it('shows field errors and clears them when corrected without saving', () => {
  const course = { title: 'AI', term: 'Fall', number: '213-2', meets: '' };
  render(<CourseForm course={course} onSave={vi.fn().mockResolvedValue(undefined)} />);
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

  expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  expect(course).toEqual({ title: 'AI', term: 'Fall', number: '213-2', meets: '' });
});

it('blocks invalid and unchanged submissions, saves once, and returns after success', async () => {
  const onSave = vi.fn();
  let finish!: () => void;
  onSave.mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
  render(<CourseForm course={{ title: 'AI', term: 'Fall', number: '101', meets: '' }} onSave={onSave} />);
  const form = screen.getByRole('form');
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.submit(form);
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Course title'), { target: { value: 'X' } });
  fireEvent.submit(form);
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Course title'), { target: { value: 'New title' } });
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  finish();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(window.location.hash).toBe('#/');
});

it('keeps the draft on a failed save and allows retry', async () => {
  const onSave = vi.fn().mockRejectedValue(new Error('offline'));
  render(<CourseForm course={{ title: 'AI', term: 'Fall', number: '101', meets: '' }} onSave={onSave} />);
  fireEvent.change(screen.getByLabelText('Course title'), { target: { value: 'New title' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save changes');
  expect(screen.getByLabelText('Course title')).toHaveValue('New title');
  expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
});
