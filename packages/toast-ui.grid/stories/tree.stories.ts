import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/tree';

import '../src/css/grid.css';

export default {
  title: 'tree'
};

const columns = [{ name: 'name' }, { name: 'artist' }];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 400, ...options });

  return { el, grid };
}

export const cascadingCheckbox = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
    treeColumnOptions: {
      name: 'name',
      useCascadingCheckbox: true
    }
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  // 체크박스 선택 해 놓음

  return rootEl;
};
