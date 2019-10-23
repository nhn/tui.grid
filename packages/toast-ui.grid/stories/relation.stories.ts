import { Omit } from 'utility-types';
import { storiesOf } from '@storybook/html';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { data, columns } from '../samples/relations';
import '../src/css/grid.css';

const stories = storiesOf('Relations', module);

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  return { data, columns };
}

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add('Select', () => {
  const { el } = createGrid(createDefaultOptions());
  return el;
});
