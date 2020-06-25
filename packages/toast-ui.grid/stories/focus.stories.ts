import { OptRow, OptColumn } from '../types/options';
import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'Focus',
};

type Options = {
  data?: OptRow[];
  rowHeight?: number | 'auto';
};

function blur(el: HTMLElement) {
  setTimeout(() => {
    (el.querySelector('.tui-grid-clipboard') as HTMLElement).focus();
    (el.querySelector('.tui-grid-clipboard') as HTMLElement).blur();
  });
}

const data = [
  { name: 'Beautiful Lies', artist: 'Birdy', type: 'Deluxe' },
  { name: 'X', artist: 'Ed Sheeran', type: 'Deluxe' },
  {
    name: 'Moves Like Jagger',
    artist: 'Maroon5',
    type: 'Single',
  },
];
const columns: OptColumn[] = [
  { name: 'name' },
  { name: 'artist' },
  { name: 'type', whiteSpace: 'pre' },
];

function createGrid(options?: Options) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, data, columns, ...options });

  return { el, grid };
}

export const activeFocus = () => {
  const { el, grid } = createGrid();
  grid.focusAt(2, 2);
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};

const focusBasicNote = `
## Focus Layer
- Active focus layer(background-color: \`#00a9ff\`)
- Inactive focus layer(background-color:  \`#aaa\`)
- The Focused Cell
  - Row Index: \`2\`
  - Column Index: \`2\`
`;

activeFocus.story = { parameters: { notes: focusBasicNote } };

export const inactiveFocus = () => {
  const { el, grid } = createGrid();
  const rootEl = document.createElement('div');

  rootEl.appendChild(el);

  grid.focusAt(2, 2);
  blur(el);

  return rootEl;
};

inactiveFocus.story = { parameters: { notes: focusBasicNote } };

export const focusWithWhitespace = () => {
  const options = {
    data: [
      { name: 'Beautiful Lies', artist: 'Birdy', type: 'Deluxe' },
      { name: 'X', artist: 'Ed Sheeran', type: 'Deluxe' },
      {
        name: 'Moves Like Jagger',
        artist: 'Maroon5',
        type: 'grid         example\ngrid newline and clipboard example\n\ngrid example',
      },
    ],
    rowHeight: 'auto',
  };
  // @ts-ignore
  const { el, grid } = createGrid(options);
  const rootEl = document.createElement('div');

  rootEl.appendChild(el);

  grid.focusAt(2, 2);

  return rootEl;
};

const focusWithWhitespaceNote = `
## Focus Layer(**whitespace: pre**)
- UI for focus layer on dynamic row height
- The Focused Cell
  - Row Index: \`2\`
  - Column Index: \`2\`
`;

focusWithWhitespace.story = { parameters: { notes: focusWithWhitespaceNote } };
