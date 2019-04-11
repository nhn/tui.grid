import { storiesOf } from '@storybook/html';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import '../src/css/grid.css';
import '../src/css/theme.css';

const stories = storiesOf('Columns', module);

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
  return { el, grid };
}

stories.add('frozenCount', () => {
  return createGrid({
    data,
    columns,
    bodyHeight: 600,
    columnOptions: {
      frozenCount: 2
    }
  }).el;
});
