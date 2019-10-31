import Grid from '../src/grid';
import '../src/css/grid.css';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';

const columns = [
  { name: 'name' },
  { name: 'artist' },
  { name: 'type' },
  { name: 'release' },
  { name: 'genre' },
  { name: 'genreCode' },
  { name: 'grade' },
  { name: 'price' },
  { name: 'downloadCount' },
  { name: 'listenCount' }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

export default {
  title: 'Header'
};

export const align = () => {
  const { el } = createGrid({
    data,
    columns,
    bodyHeight: 'fitToParent',
    columnOptions: {
      frozenCount: 2,
      minWidth: 150
    },
    rowHeaders: [
      {
        type: 'rowNum',
        align: 'left',
        valign: 'bottom'
      },
      {
        type: 'checkbox',
        align: 'left',
        valign: 'top'
      }
    ],
    header: {
      height: 40,
      align: 'left',
      valign: 'top',
      columns: [
        {
          name: '_number',
          valign: 'bottom'
        },
        {
          name: 'type',
          align: 'left',
          valign: 'middle'
        },
        {
          name: 'release',
          align: 'center'
        }
      ]
    }
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};

export const merge = () => {
  const { el } = createGrid({
    data,
    columns: [
      { name: 'name', resizable: true },
      { name: 'artist', resizable: true },
      { name: 'type' },
      { name: 'release' },
      { name: 'genre' },
      { name: 'genreCode' },
      { name: 'grade' }
    ],
    bodyHeight: 'fitToParent',
    columnOptions: {
      frozenCount: 2,
      minWidth: 100
    },
    header: {
      height: 40,
      colspan: {
        name: 2,
        genre: 3
      }
    }
  });

  return el;
};
