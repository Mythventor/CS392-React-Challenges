import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import App from './App';
import { loadSchedule, saveCourse } from './utilities/firebase';
vi.mock('./utilities/firebase', () => ({ loadSchedule: vi.fn(), saveCourse: vi.fn() }));

const mockSchedule = (courses: Record<string, unknown>) => {
  vi.mocked(loadSchedule).mockResolvedValue({ title: 'CS Courses', courses });
};

// jsdom lacks native dialog methods; browser focus trapping is not simulated.
beforeAll(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    } },
    close: { configurable: true, value: function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    } },
  });
});

afterAll(() => {
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it('defaults to Fall and switches courses without fetching again', async () => {
  const courses = Object.fromEntries(['Fall', 'Winter', 'Spring'].map((term) => [
    term, { term, number: '101', title: `${term} class`, meets: 'MWF 10:00-10:50' },
  ]));
  mockSchedule(courses);
  const fetchMock = vi.mocked(loadSchedule);
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
    F101: { term: 'Fall', number: '101', title: 'First course', meets: 'MWF 10:00-10:50' },
    F110: { term: 'Fall', number: '110', title: 'Second course', meets: 'MWF 11:00-11:50' },
    W101: { term: 'Winter', number: '101', title: 'Winter course', meets: 'MWF 10:00-10:50' },
  };
  mockSchedule(courses);
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

it('opens an empty plan and supports inside clicks, close, outside click, and Escape', async () => {
  mockSchedule({});
  render(<App />);
  const open = await screen.findByRole('button', { name: 'Course plan' });
  open.focus();
  fireEvent.click(open);
  const dialog = screen.getByRole('dialog', { name: 'Course plan' });
  expect(within(dialog).getByText(/No courses selected/)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('heading', { name: 'Course plan' }));
  expect(dialog).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(open).toHaveFocus();
  fireEvent.click(open);
  fireEvent.click(screen.getByRole('dialog'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(open);
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('shows selected courses across terms and preserves them after closing', async () => {
  const courses = {
    F101: { term: 'Fall', number: '101', title: 'Fall class', meets: 'MWF 10:00-10:50' },
    W202: { term: 'Winter', number: '202', title: 'Winter class', meets: 'TuTh 12:00-12:50' },
    W303: { term: 'Winter', number: '303', title: 'Unselected class', meets: 'MWF 13:00-13:50' },
  };
  mockSchedule(courses);
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: /Fall CS 101/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Winter' }));
  fireEvent.click(screen.getByRole('button', { name: /Winter CS 202/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Course plan' }));
  const plan = within(screen.getByRole('dialog'));
  expect(plan.getAllByRole('listitem')).toHaveLength(2);
  for (const text of ['Fall CS 101', 'Fall class', 'MWF 10:00-10:50', 'Winter CS 202', 'Winter class', 'TuTh 12:00-12:50']) {
    expect(plan.getByText(text)).toBeInTheDocument();
  }
  expect(plan.queryByText('Unselected class')).not.toBeInTheDocument();
  fireEvent.click(plan.getByRole('button', { name: 'Close' }));
  expect(screen.getByRole('button', { name: /Winter CS 202/ })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: /Winter CS 202/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Course plan' }));
  expect(within(screen.getByRole('dialog')).getAllByRole('listitem')).toHaveLength(1);
});

it('blocks conflicts and restores availability after unselecting', async () => {
  const courses = {
    F101: { term: 'Fall', number: '101', title: 'First', meets: 'MWF 9:00-9:50' },
    F102: { term: 'Fall', number: '102', title: 'Conflict', meets: 'W 9:30-10:20' },
    F103: { term: 'Fall', number: '103', title: 'Next', meets: 'MWF 9:50-10:40' },
    F104: { term: 'Fall', number: '104', title: 'No meeting', meets: '' },
    W101: { term: 'Winter', number: '101', title: 'Other term', meets: 'MWF 9:00-9:50' },
  };
  mockSchedule(courses);
  render(<App />);
  const first = await screen.findByRole('button', { name: /Fall CS 101/ });
  const conflict = screen.getByRole('button', { name: /Fall CS 102/ });
  fireEvent.click(first);
  expect(first).toBeEnabled();
  expect(conflict).toBeDisabled();
  expect(within(conflict).getByText('Time conflict')).toBeInTheDocument();
  fireEvent.click(conflict);
  expect(conflict).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('button', { name: /Fall CS 103/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /Fall CS 104/ })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Winter' }));
  expect(screen.getByRole('button', { name: /Winter CS 101/ })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Fall' }));
  fireEvent.click(screen.getByRole('button', { name: /Fall CS 101/ }));
  const restored = screen.getByRole('button', { name: /Fall CS 102/ });
  expect(restored).toBeEnabled();
  fireEvent.click(restored);
  expect(restored).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: /Fall CS 101/ })).toBeDisabled();
});

it('edits a course draft without submitting or changing the saved course and selections', async () => {
  const courses = {
    W101: { term: 'Winter', number: '101', title: 'Original title', meets: 'MWF 9:00-9:50' },
    W102: { term: 'Winter', number: '102', title: 'Conflicting course', meets: 'MWF 9:00-9:50' },
  };
  mockSchedule(courses);
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: 'Winter' }));
  fireEvent.click(screen.getByRole('button', { name: /Winter CS 101/ }));
  expect(screen.getByRole('button', { name: /Winter CS 102/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('link', { name: 'Edit Winter CS 102' }));
  expect(await screen.findByLabelText('Course title')).toHaveValue('Conflicting course');
  expect(screen.getByLabelText('Meeting times')).toHaveValue('MWF 9:00-9:50');
  fireEvent.change(screen.getByLabelText('Course title'), { target: { value: 'Draft' } });
  fireEvent.change(screen.getByLabelText('Meeting times'), { target: { value: 'Anything for now' } });
  expect(screen.getByLabelText('Course title')).toHaveValue('Draft');
  expect(screen.getByLabelText('Meeting times')).toHaveValue('Anything for now');
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(fireEvent.submit(screen.getByRole('form', { name: 'Edit course' }))).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByRole('button', { name: /Winter CS 101/ })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: /Winter CS 102/ })).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(screen.getByRole('link', { name: 'Edit Winter CS 102' }));
  expect(await screen.findByLabelText('Course title')).toHaveValue('Conflicting course');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await screen.findByRole('button', { name: 'Winter' });
});

it('shows loading while Firestore is pending and a readable connection error', async () => {
  vi.mocked(loadSchedule).mockRejectedValue(new Error('Firestore unavailable'));
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading courses');
  expect(await screen.findByRole('alert')).toHaveTextContent('Firestore unavailable');
});

it('updates the course card after a successful submission without refetching', async () => {
  mockSchedule({ F101: { title: 'Original title', term: 'Fall', number: '101', meets: '' } });
  vi.mocked(saveCourse).mockResolvedValue(undefined);
  render(<App />);
  fireEvent.click(await screen.findByRole('link', { name: 'Edit Fall CS 101' }));
  fireEvent.change(await screen.findByLabelText('Course title'), { target: { value: 'Updated title' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByRole('button', { name: /Updated title/ })).toBeInTheDocument();
  expect(saveCourse).toHaveBeenCalledWith('F101', { title: 'Updated title', term: 'Fall', number: '101', meets: '' });
  expect(loadSchedule).toHaveBeenCalledTimes(1);
});
