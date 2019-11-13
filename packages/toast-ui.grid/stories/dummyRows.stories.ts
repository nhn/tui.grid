import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';

import '../src/css/grid.css';

export default {
  title: 'Dummy Rows'
};

const columns = [{ name: 'name', minWidth: 150 }, { name: 'artist', minWidth: 150 }];

const slicedData = data.slice(0, 5);

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

export const showDummyRows = () => {
  const { el } = createGrid({
    data: slicedData,
    columns,
    bodyHeight: 400,
    showDummyRows: true
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

export const useRowHeaders = () => {
  const { el } = createGrid({
    data: slicedData,
    columns,
    showDummyRows: true,
    bodyHeight: 400,
    rowHeaders: ['rowNum', 'checkbox']
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};
