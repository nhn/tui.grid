import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Filter', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', filter: 'text', editor: 'text' },
  { name: 'downloadCount', filter: { type: 'number', operator: 'AND' } },
  { name: 'type', filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
  { name: 'artist', filter: 'select' },
  { name: 'release', filter: 'date' },
  { name: 'genre' }
];

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  return { data, columns };
}

function createGrid(customOptions: Record<string, unknown> = {}) {
  const defaultOptions = createDefaultOptions();
  const options = { ...defaultOptions, ...customOptions };
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
