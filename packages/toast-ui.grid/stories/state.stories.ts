import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'State layer'
};

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

const columns = [{ name: 'name' }, { name: 'artist' }];

export const noData = () => {
  const { el } = createGrid({ columns, bodyHeight: 'fitToParent' });

  return el;
};

const noDataNote = `
## State

- If there is no data, the "no data" text is shown. 
`;
noData.story = { parameters: { notes: noDataNote } };
