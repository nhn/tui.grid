import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';

import '../src/css/grid.css';

const stories = storiesOf('Dummy Rows', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', minWidth: 150 },
  { name: 'artist', minWidth: 150 },
  { name: 'type', minWidth: 150 },
  { name: 'release', minWidth: 150 },
  { name: 'genre', minWidth: 150 }
];

const slicedData = data.slice(0, 2);

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add('show dummy rows', () => {
  const { el } = createGrid({
    data: slicedData,
    columns,
    bodyHeight: 400,
    showDummyRows: true
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
});

stories.add('use row headers', () => {
  const { el } = createGrid({
    data: slicedData,
    columns,
    showDummyRows: true,
    bodyHeight: 400,
    rowHeaders: ['_number', '_checked']
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
});

stories.add('apply striped theme', () => {
  const { el } = createGrid({
    data: slicedData,
    columns,
    showDummyRows: true,
    bodyHeight: 400,
    rowHeaders: ['_number', '_checked']
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  Grid.applyTheme('striped');

  return rootEl;
});
