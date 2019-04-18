import { storiesOf } from '@storybook/html';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Dimension', module);

const columns = [
  { name: 'name' },
  { name: 'artist' },
  { name: 'type' },
  { name: 'release' },
  { name: 'genre' }
];

function createGrid(options: any) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });
  return { el, grid };
}

stories.add('bodyHeight: fitToParent', () => {
  const { el } = createGrid({ data, columns, bodyHeight: 'fitToParent' });
  const rootEl = document.createElement('div');
  rootEl.style.height = '400px';
  rootEl.appendChild(el);

  return rootEl;
});

stories.add('bodyHeight: auto', () => {
  return createGrid({ data, columns }).el;
});

stories.add('bodyHeight: 500', () => {
  return createGrid({ data, columns, bodyHeight: 500 }).el;
});

stories.add('rowHeight: 70', () => {
  return createGrid({ data, columns, bodyHeight: 500, rowHeight: 70 }).el;
});
