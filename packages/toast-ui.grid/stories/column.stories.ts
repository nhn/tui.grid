import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import { button, number } from '@storybook/addon-knobs';
import '../src/css/grid.css';

export default {
  title: 'Column'
};

const columns = [
  { name: 'name', minWidth: 150, className: ['test1', 'test2'] },
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

export const frozenCount = () => {
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
};

export const frozenBorderStyle = () => {
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
};

export const keyColumnName = () => {
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
};

export const showAndHideColumn = () => {
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
};
