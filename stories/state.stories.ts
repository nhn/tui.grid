import { storiesOf } from '@storybook/html';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import '../src/css/grid.css';

const stories = storiesOf('State Layer', module);

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

const columns = [{ name: 'name' }, { name: 'artist' }, { name: 'type' }];

stories.add('No Data', () => {
  const { el } = createGrid({ columns, bodyHeight: 'fitToParent' });

  return el;
});
