import { OptGrid } from '../types/options';
import Grid from '../src/grid';
import '../src/css/grid.css';
import { cls } from '../src/helper/dom';

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

function getRsideBody(el: HTMLElement) {
  return el.querySelector(`.${cls('rside-area')} .${cls('body-area')}`)!;
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

const largeColumns = [
  { name: 'name', minWidth: 200, filter: 'text' as const },
  { name: 'artist', minWidth: 200 },
  { name: 'type', minWidth: 200 },
  { name: 'price', minWidth: 200 },
  { name: 'release', minWidth: 200 },
  { name: 'genre', minWidth: 200 },
];

export const dummyRowsWithScroll = () => {
  const { el, grid } = createGrid({
    data,
    columns: largeColumns,
    bodyHeight: 400,
    scrollX: true,
    showDummyRows: true,
  });
  grid.filter('name', [{ code: 'eq', value: 'text' }]);
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  setTimeout(() => {
    const rsideBody = getRsideBody(el);
    rsideBody.scrollLeft = 420;
  });

  return rootEl;
};

const dummyRowsWithScrollNote = `
## Dummy Rows
- Show the dummy cells when scrollX is located at the farthest right.
`;
dummyRowsWithScroll.story = { parameters: { notes: dummyRowsWithScrollNote } };
