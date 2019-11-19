import Grid from '../src/grid';
import '../src/css/grid.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import { data } from '../samples/basic';
import { OptGrid } from '../src/types';

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '600px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

function getByTestId(el, testId) {
  return el.querySelector(`[data-testid="${testId}"]`);
}

const columns = [
  { name: 'name' },
  { name: 'artist' },
  { name: 'type' },
  { name: 'release' },
  { name: 'genre' }
];

export default {
  title: 'Selection'
};

export const normal = () => {
  const { grid, el } = createGrid({
    columns,
    data: data.slice(0, 10),
    rowHeaders: ['rowNum'],
    bodyHeight: 300,
    columnOptions: {
      frozenCount: 2,
      minWidth: 150
    }
  });
  grid.setSelectionRange({ start: [1, 1], end: [5, 3] });

  return el;
};

const normalNote = `
## Selection

### Following areas should be highlighted
- Selected cells
- Row-header of selected cells
- Column-header of selected cells
`;
normal.story = { parameters: { notes: normalNote } };

export const scrolled = () => {
  const { grid, el } = createGrid({
    columns,
    data: data.slice(0, 10),
    rowHeaders: ['rowNum'],
    bodyHeight: 300,
    columnOptions: {
      frozenCount: 2,
      minWidth: 150
    }
  });

  grid.setSelectionRange({ start: [1, 1], end: [5, 3] });
  setTimeout(() => {
    const rsideBody = getByTestId(el, 'rside-body');
    rsideBody.scrollTop = 70;
    rsideBody.scrollLeft = 100;
  });

  return el;
};

const scrolledNote = `
## Selection (Scrolled)
- Selection layer should follow the scroll position
`;

scrolled.story = { parameters: { notes: scrolledNote } };
