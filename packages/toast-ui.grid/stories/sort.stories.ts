import Grid from '../src/grid';
import { OptGrid, OptColumn } from '../src/types';
import { Omit } from 'utility-types';
import '../src/css/grid.css';

export default {
  title: 'Sort'
};

const data = [{ A: 'A', B: 'B', C: 'C' }, { A: 'B', B: 'A', C: 'C' }, { A: 'C', B: 'B', C: 'A' }];

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  const columns: OptColumn[] = [
    {
      name: 'A',
      header: 'Default Sort Button',
      minWidth: 150,
      sortable: true
    },
    {
      name: 'B',
      header: 'ASC Button(Multi First)',
      minWidth: 150,
      sortable: true
    },
    {
      name: 'C',
      header: 'DESC Button(Multi Second)',
      minWidth: 150,
      sortable: true
    }
  ];

  return { data, columns };
}

function createGrid(customOptions: Record<string, unknown> = {}) {
  const defaultOptions = createDefaultOptions();
  const options = { ...defaultOptions, ...customOptions };
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 170, ...options });

  return { el, grid };
}

export const sortButton = () => {
  const { el, grid } = createGrid();

  grid.sort('B', true);
  grid.sort('C', false, true);

  return el;
};
