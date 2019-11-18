import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'state layer'
};

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  Grid.setLanguage('en');
  const grid = new Grid({ el, ...options });

  return { el, grid };
}

const columns = [{ name: 'name' }, { name: 'artist' }];

export const noData = () => {
  const { el } = createGrid({ columns, bodyHeight: 'fitToParent' });

  return el;
};
