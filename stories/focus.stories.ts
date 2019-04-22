import { storiesOf } from '@storybook/html';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Focus', module);

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

stories.add('Focus Activation', () => {
  const { el } = createGrid({
    data,
    columns,
    bodyHeight: 'fitToParent',
    columnOptions: {
      frozenCount: 2
    }
  });
  const rootEl = document.createElement('div');
  rootEl.style.height = '400px';
  rootEl.appendChild(el);

  return rootEl;
});
