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
  { name: 'name', filter: 'text' },
  { name: 'downloadCount', filter: 'number' },
  { name: 'artist', filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
  {
    name: 'release',
    filter: {
      type: 'date',
      options: {
        format: 'yyyy-mm',
        type: 'month'
      }
    }
  },
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

  const grid = new Grid({ el, bodyHeight: 170, ...options });

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
