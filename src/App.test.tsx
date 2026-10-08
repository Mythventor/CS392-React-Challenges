import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from './App';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('defaults to Fall and switches courses without fetching again', async () => {
  const courses = Object.fromEntries(['Fall', 'Winter', 'Spring'].map((term) => [
    term, { term, number: '101', title: `${term} class`, meets: 'MWF 10:00-10:50' },
  ]));
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ schedules: { 'CS-2018-2019': { title: 'CS Courses', courses } } }),
  });
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);

  await screen.findByRole('list', { name: 'Fall courses' });
  for (const term of ['Fall', 'Winter', 'Spring', 'Fall']) {
    fireEvent.click(screen.getByRole('button', { name: term }));
    expect(screen.getByRole('button', { name: term })).toHaveAttribute('aria-pressed', 'true');
    const list = screen.getByRole('list', { name: `${term} courses` });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list).getByText(`${term} class`)).toBeInTheDocument();
    for (const other of ['Fall', 'Winter', 'Spring'].filter((value) => value !== term)) {
      expect(screen.queryByText(`${other} class`)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: other })).toHaveAttribute('aria-pressed', 'false');
    }
  }
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
