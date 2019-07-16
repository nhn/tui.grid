import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid, OptColumn } from '../src/types';
import { Omit } from 'utility-types';
import { data as sampleData } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Sort', module);
stories.addDecorator(withKnobs);

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  const data = sampleData.slice();
  const columns: OptColumn[] = [
    { name: 'name', minWidth: 150, sortable: true, sortingType: 'desc', editor: 'text' },
    { name: 'artist', minWidth: 150, sortable: true, sortingType: 'asc', editor: 'text' },
    { name: 'type', minWidth: 150 },
    { name: 'genre', minWidth: 150 },
    { name: 'price', minWidth: 150 },
    { name: 'downloadCount', minWidth: 150 }
  ];

  return { data, columns };
}

function createGrid(customOptions: Record<string, unknown> = {}) {
  const defaultOptions = createDefaultOptions();
  const options = { ...defaultOptions, ...customOptions };
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add(
  'sort',
  () => {
    const { el } = createGrid();

    return el;
  },
  { html: { preventForcedRender: true } }
);
