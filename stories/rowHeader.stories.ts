import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Row Headers', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', minWidth: 150 },
  { name: 'artist', minWidth: 150 },
  { name: 'type', minWidth: 300 },
  { name: 'release', minWidth: 300 },
  { name: 'genre', minWidth: 300 }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add('rowNum', () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['rowNum']
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
});

stories.add('rowNum with frozenColumns', () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['rowNum'],
    columnOptions: {
      frozenCount: 2
    }
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
});
