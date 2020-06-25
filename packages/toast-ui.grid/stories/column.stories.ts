import { OptRow, OptColumn } from '../types/options';
import { ColumnOptions } from '../types/store/column';
import Grid from '../src/grid';
import '../src/css/grid.css';

type Options = {
  data?: OptRow[];
  columns?: OptColumn[];
  columnOptions?: ColumnOptions;
};

export default {
  title: 'Column',
};

const columns = [
  { name: 'name', minWidth: 150 },
  { name: 'artist', minWidth: 150 },
  { name: 'type', minWidth: 150 },
  { name: 'release', minWidth: 150 },
  { name: 'genre', minWidth: 150 },
];

function createGrid(options: Options) {
  const el = document.createElement('div');
  const data = [
    {
      name: 'Beautiful Lies',
      artist: 'Birdy',
      release: '2016.03.26',
      type: 'Deluxe',
      genre: 'Pop',
    },
  ];
  el.style.width = '700px';

  const grid = new Grid({ el, data, columns, ...options });

  return { el, grid };
}

export const frozenColumnCount = () => {
  const { el } = createGrid({ columnOptions: { frozenCount: 2 } });
  return el;
};

const frozenColumnCountNote = `
## Frozen Column Count
- Columns can be pinned in the left side
- Left side: \`name\`, \`artist\`
- Right side: \`type\`, \`release\`, \`genre\`
`;

frozenColumnCount.story = { parameters: { notes: frozenColumnCountNote } };

export const frozenBorderWidth = () => {
  const { el } = createGrid({ columnOptions: { frozenCount: 2, frozenBorderWidth: 3 } });
  return el;
};

const frozenBorderWidthNote = `
## Frozen Border Width
- Border width can be configured
- Default value is \`1\`
`;

frozenBorderWidth.story = { parameters: { notes: frozenBorderWidthNote } };

export const alignAndVerticalAlign = () => {
  const { el } = createGrid({
    data: [
      {
        name: 'Beautiful Lies',
        artist: 'Birdy',
        release: '2016.03.26',
        type: 'Deluxe',
      },
      {
        name: 'X',
        artist: 'Ed Sheeran',
        release: '2014.06.24',
        type: 'Deluxe',
      },
      {
        name: 'Moves Like Jagger',
        release: '2011.08.08',
        artist: 'Maroon5',
        type: 'Single',
      },
    ],
    columns: [
      { name: 'name' },
      { name: 'artist', align: 'center', valign: 'top' },
      { name: 'type', align: 'right', valign: 'bottom' },
    ],
  });
  return el;
};

const alignAndVerticalAlignNote = `
## Align and Vertical Align
- It's possible to specify align, valign in each column
- name
  - align: \`left\`(default)
  - vertical align: \`middle\`(default)
- artist
  - align: \`center\`
  - vertical align: \`top\`
- type
  - align: \`right\`
  - vertical align: \`bottom\`
`;

alignAndVerticalAlign.story = { parameters: { notes: alignAndVerticalAlignNote } };

export const ellipsis = () => {
  const data = [
    {
      name: 'Beautiful Lies',
      artist: 'Birdy',
      type:
        'grid         example\ngrid newline example\n\ngrid newline example\n\ngrid newline example\n\n',
    },
  ];
  const { el } = createGrid({
    data,
    columns: [{ name: 'name' }, { name: 'artist' }, { name: 'type', ellipsis: true }],
  });
  return el;
};

const ellipsisNote = `
## Ellipsis
- Apply ellipsis option about long text data
- The ellipsis of the content of \`type\` column
`;

ellipsis.story = { parameters: { notes: ellipsisNote } };
