import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';

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

const data = [
  {
    id: 549731,
    name: 'Beautiful Lies',
    artist: 'Birdy',
    release: '2016.03.26',
    type: 'Deluxe',
    typeCode: '1',
    genre: 'Pop',
    genreCode: '1',
    grade: '4',
    price: 10000,
    downloadCount: 1000,
    listenCount: 5000
  },
  {
    id: 436461,
    name: 'X',
    artist: 'Ed Sheeran',
    release: '2014.06.24',
    type: 'Deluxe',
    typeCode: '1',
    genre: 'Pop',
    genreCode: '1',
    grade: '5',
    price: 20000,
    downloadCount: 1000,
    listenCount: 5000
  }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 400, ...options });

  return { el, grid };
}

stories.add('use showDummyRows', () => {
  const { el } = createGrid({
    data,
    columns,
    showDummyRows: true
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
});
