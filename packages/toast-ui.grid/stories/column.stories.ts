import Grid from '../src/grid';
import '../src/css/grid.css';
import { OptColumnOptions, OptColumn, OptRow } from '../src/types';

type Options = {
  data?: OptRow[];
  columns?: OptColumn[];
  columnOptions?: OptColumnOptions;
};

export default {
  title: 'Column'
};

const columns = [{ name: 'name' }, { name: 'artist' }, { name: 'type' }, { name: 'release' }];

function createGrid(options: Options) {
  const el = document.createElement('div');
  const data = [
    {
      name: 'Beautiful Lies',
      artist: 'Birdy',
      release: '2016.03.26',
      type: 'Deluxe'
    }
  ];
  el.style.width = '800px';

  const grid = new Grid({ el, data, columns, ...options });

  return { el, grid };
}

export const frozenCount = () => {
  const { el } = createGrid({ columnOptions: { frozenCount: 2 } });
  return el;
};

export const frozenBorderWidth = () => {
  const { el } = createGrid({ columnOptions: { frozenCount: 2, frozenBorderWidth: 3 } });
  return el;
};

export const alignAndVerticalAlign = () => {
  const { el } = createGrid({
    data: [
      {
        name: 'Beautiful Lies',
        artist: 'Birdy',
        release: '2016.03.26',
        type: 'Deluxe'
      },
      {
        name: 'X',
        artist: 'Ed Sheeran',
        release: '2014.06.24',
        type: 'Deluxe'
      },
      {
        name: 'Moves Like Jagger',
        release: '2011.08.08',
        artist: 'Maroon5',
        type: 'Single'
      }
    ],
    columns: [
      { name: 'name' },
      { name: 'artist', align: 'center', valign: 'top' },
      { name: 'type', align: 'right', valign: 'bottom' }
    ]
  });
  return el;
};

export const ellipsis = () => {
  const data = [
    {
      name: 'Beautiful Lies',
      artist: 'Birdy',
      type:
        'grid         example\ngrid newline example\n\ngrid newline example\n\ngrid newline example\n\n'
    }
  ];
  const { el } = createGrid({
    data,
    columns: [{ name: 'name' }, { name: 'artist' }, { name: 'type', ellipsis: true }]
  });
  return el;
};
