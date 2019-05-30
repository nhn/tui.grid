import { storiesOf } from '@storybook/html';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import { withKnobs, button, number } from '@storybook/addon-knobs';
import '../src/css/grid.css';

const stories = storiesOf('Columns', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', minWidth: 150 },
  { name: 'artist', minWidth: 150 },
  { name: 'type', minWidth: 300 },
  { name: 'release', minWidth: 300 },
  { name: 'genre', minWidth: 300 }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add(
  'frozenCount',
  () => {
    const { grid, el } = createGrid({
      data,
      columns,
      bodyHeight: 400,
      columnOptions: {
        frozenCount: 2
      }
    });

    button('setFrozenColumnCount(1)', () => grid.setFrozenColumnCount(1));
    button('setFrozenColumnCount(2)', () => grid.setFrozenColumnCount(2));
    button('setFrozenColumnCount(3)', () => grid.setFrozenColumnCount(3));

    return el;
  },
  { html: { preventForcedRender: true } }
);

stories.add('frozenBorderWidth', () => {
  const numberOptions = { range: true, min: 1, max: 10 };
  const frozenBorderWidth = number('frozenBorderWidth', 1, numberOptions);

  const { el } = createGrid({
    data,
    columns,
    bodyHeight: 400,
    columnOptions: {
      frozenCount: 2,
      frozenBorderWidth
    }
  });

  return el;
});

stories.add(
  'keyColumnName',
  () => {
    const myData = data.map((row, idx) => ({
      ...row,
      songId: String(idx + 1000)
    }));
    const myColumns = [{ name: 'songId', width: 100 }, ...columns];

    const { grid, el } = createGrid({
      data: myData,
      columns: myColumns,
      keyColumnName: 'songId'
    });

    button(`getValue('1001', 'artist')`, () => alert(grid.getValue('1001', 'artist')));

    return el;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'show/hide column',
  () => {
    const { grid, el } = createGrid({
      data,
      columns,
      bodyHeight: 400,
      columnOptions: { frozenCount: 2 }
    });

    button(`hideColumn('type')`, () => grid.hideColumn('type'));
    button(`showColumn('type')`, () => grid.showColumn('type'));
    button(`hideColumn('artist')`, () => grid.hideColumn('artist'));
    button(`showColumn('artist')`, () => grid.showColumn('artist'));

    return el;
  },
  { html: { preventForcedRender: true } }
);
