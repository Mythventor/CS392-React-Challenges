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

it('selects multiple courses independently and preserves selections across terms', async () => {
  const courses = {
    F101: { term: 'Fall', number: '101', title: 'First course', meets: 'MWF 10:00' },
    F110: { term: 'Fall', number: '110', title: 'Second course', meets: 'MWF 11:00' },
    W101: { term: 'Winter', number: '101', title: 'Winter course', meets: 'MWF 10:00' },
  };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ schedules: { 'CS-2018-2019': { title: 'CS Courses', courses } } }),
  }));
  render(<App />);
  const first = await screen.findByRole('button', { name: /Fall CS 101/ });
  const second = screen.getByRole('button', { name: /Fall CS 110/ });
  expect(first).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(first);
  fireEvent.click(second);
  expect(first).toHaveAttribute('aria-pressed', 'true');
  expect(second).toHaveAttribute('aria-pressed', 'true');
  expect(first).toHaveClass('bg-purple-100');

  fireEvent.click(screen.getByRole('button', { name: 'Winter' }));
  const winter = screen.getByRole('button', { name: /Winter CS 101/ });
  expect(winter).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(winter);
  fireEvent.click(screen.getByRole('button', { name: 'Fall' }));
  const restored = screen.getByRole('button', { name: /Fall CS 101/ });
  expect(restored).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(restored);
  expect(restored).toHaveAttribute('aria-pressed', 'false');
  expect(restored).toHaveClass('bg-white');
  expect(screen.getByRole('button', { name: /Fall CS 110/ })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Winter' }));
  expect(screen.getByRole('button', { name: /Winter CS 101/ })).toHaveAttribute('aria-pressed', 'true');
});
