import { OptGrid } from '../types/options';
import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'Dummy Rows',
};

const data = [
  { name: 'Beautiful Lies', artist: 'Birdy' },
  { name: 'X', artist: 'Ed Sheeran' },
];
const columns = [
  { name: 'name', minWidth: 150 },
  { name: 'artist', minWidth: 150 },
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

export const dummyRows = () => {
  const { el } = createGrid({
    data,
    columns,
    bodyHeight: 400,
    showDummyRows: true,
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

const dummyRowsNote = `
## Dummy Rows
- Show the dummy rows to fill remaining area in grid
`;
dummyRows.story = { parameters: { notes: dummyRowsNote } };
