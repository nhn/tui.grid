import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'RowSpan',
};

const data = [
  {
    name: 'Beautiful Lies',
    artist: 'Birdy',
    type: 'Deluxe',
    _attributes: {
      rowSpan: {
        name: 2,
        artist: 3,
      },
    },
  },
  {
    name: 'Beautiful Lies',
    artist: 'Birdy',
    type: 'Deluxe',
  },
  {
    name: 'Skinny Love',
    artist: 'Birdy',
    type: 'Single',
    _attributes: {
      rowSpan: {
        type: 2,
      },
    },
  },
  {
    name: 'A Head Full Of Dreams',
    artist: 'Coldplay',
    type: 'Single',
  },
  {
    name: '21',
    artist: 'Adele',
    type: 'Deluxe',
    _attributes: {
      rowSpan: {
        artist: 3,
      },
    },
  },
  {
    name: '25',
    artist: 'Adele',
    type: 'Deluxe',
  },
  {
    name: 'Water Under The Bridge',
    artist: 'Adele',
    type: 'Single',
  },
  {
    name: 'Make Out',
    artist: 'LANY',
    type: 'EP',
  },
];

const columns = [
  { name: 'name', editor: 'text' },
  { name: 'artist', editor: 'text' },
  { name: 'type', editor: 'text' },
];

function createGrid() {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, data, columns });

  return { el, grid };
}

export const basic = () => {
  const { el } = createGrid();

  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

const basicNote = `
## Row Span
- Basic UI for cells with rowspan
`;
basic.story = { parameters: { notes: basicNote } };

export const rowSpanFocus = () => {
  const { el, grid } = createGrid();

  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  grid.focusAt(4, 1);

  return rootEl;
};

const rowSpanFocusNote = `
## Row Span
- UI for focus layer with rowspan cell
- The Focused Cell
  - Row Index: \`4\`
  - Column Index: \`1\`
`;
rowSpanFocus.story = { parameters: { notes: rowSpanFocusNote } };

export const rowSpanEditor = () => {
  const { el, grid } = createGrid();

  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  grid.startEditingAt(4, 1);

  return rootEl;
};

const rowSpanEditorNote = `
## Row Span
- UI for editing layer with rowspan cell
- The Editing Cell
  - Row Index: \`4\`
  - Column Index: \`1\`
`;
rowSpanEditor.story = { parameters: { notes: rowSpanEditorNote } };

export const rowSpanSelection = () => {
  const { el, grid } = createGrid();

  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  grid.setSelectionRange({ start: [3, 0], end: [4, 1] });

  return rootEl;
};

const rowSpanSelectionNote = `
## Row Span

- For Cells with rowspan, selection is applied as one cell shown in the example.
- The Selection Range
  - Row Range: \`[3, 4]\`
  - Column Range: \`[0, 1]\`
`;
rowSpanSelection.story = { parameters: { notes: rowSpanSelectionNote } };
