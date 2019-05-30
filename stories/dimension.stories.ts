import { storiesOf } from '@storybook/html';
import Grid from '../src/grid';
import { OptGrid, OptRow } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';
import { range } from '../src/helper/common';

const stories = storiesOf('Dimension', module);

const columns = [
  { name: 'name' },
  { name: 'artist' },
  { name: 'type' },
  { name: 'release' },
  { name: 'genre' }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  (window as any).grid = grid;

  return { el, grid };
}

stories.add('bodyHeight: fitToParent', () => {
  const { el } = createGrid({ data, columns, bodyHeight: 'fitToParent' });
  const rootEl = document.createElement('div');
  rootEl.style.height = '400px';
  rootEl.appendChild(el);

  return rootEl;
});

stories.add('bodyHeight: auto', () => {
  return createGrid({ data, columns }).el;
});

stories.add('bodyHeight: 500', () => {
  return createGrid({ data, columns, bodyHeight: 500 }).el;
});

stories.add('rowHeight: 70', () => {
  return createGrid({ data, columns, bodyHeight: 500, rowHeight: 70 }).el;
});

stories.add('rowHeight: custom', () => {
  const myData: OptRow[] = data.map((row) => ({ ...row })).slice(0, 5);
  myData[0]._attributes = {
    height: 100
  };
  myData[2]._attributes = {
    height: 200
  };

  return createGrid({ data: myData, columns, bodyHeight: 500 }).el;
});

stories.add('rowHeight: auto', () => {
  const myColumns: OptGrid['columns'] = [
    { name: 'col1', whiteSpace: 'pre', editor: 'text' },
    { name: 'col2', whiteSpace: 'normal', editor: 'text' }
  ];
  const myData = [
    {
      col1: 'Short',
      col2: 'Short'
    },
    {
      col1: 'Long\n\n\n\n\n\nSeven new lines',
      col2: 'Short'
    },
    {
      col1: 'Short',
      col2: range(100).join('-')
    },
    {
      col1: 'Short',
      col2: 'Short'
    }
  ];

  return createGrid({ data: myData, columns: myColumns, rowHeight: 'auto', bodyHeight: 'auto' }).el;
});

stories.add('column resizeable', () => {
  const myColumns = columns.map((column) => ({ ...column, resizable: true }));

  return createGrid({ data, columns: myColumns, bodyHeight: 500 }).el;
});
