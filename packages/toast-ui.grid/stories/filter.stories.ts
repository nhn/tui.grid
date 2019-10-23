import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Filter', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', filter: 'text', editor: { type: 'text' } },
  { name: 'downloadCount', filter: { type: 'number', operator: 'AND' } },
  { name: 'type', filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
  { name: 'artist', filter: 'select' },
  {
    name: 'release',
    filter: { type: 'date', options: { format: 'yyyy.MM.dd', date: new Date(2019, 9, 18) } }
  },
  { name: 'genre' }
];

function createGrid() {
  const options = { data, columns };
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options, bodyHeight: 500 });

  return { el, grid };
}

stories.add(
  'filter',
  () => {
    const { el } = createGrid();

    return el;
  },
  { html: { preventForcedRender: true } }
);
