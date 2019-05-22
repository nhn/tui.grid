import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data as basicData } from '../samples/basic';
import { data } from '../samples/attributes';
import '../src/css/grid.css';

const stories = storiesOf('Attributes', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name' },
  { name: 'artist' },
  { name: 'type', editor: 'text' },
  { name: 'release', editor: 'text' },
  { name: 'genre', editor: 'text' },
  { name: 'genreCode', editor: 'text' },
  { name: 'grade', editor: 'text' },
  { name: 'price', editor: 'text' },
  { name: 'downloadCount', editor: 'text' },
  { name: 'listenCount', editor: 'text' }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add(
  'basic',
  () => {
    const { el, grid } = createGrid({
      data: basicData,
      columns,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      copyOptions: {
        useFormattedValue: true
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('enable', () => grid.enable());
    button('disable', () => grid.disable());
    button('disableRow(1)', () => grid.disableRow(1));
    button('enableRow(1)', () => grid.enableRow(1));
    button('disableRow(3, true)', () => grid.disableRow(3, true));
    button('disableRow(4, false)', () => grid.disableRow(4, false));
    button('enableRow(3, true)', () => grid.enableRow(3, true));
    button('enableRow(4, false)', () => grid.enableRow(4, false));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'row header with checkbox',
  () => {
    const { el, grid } = createGrid({
      data,
      columns,
      rowHeaders: ['_checked'],
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      copyOptions: {
        useFormattedValue: true
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('enable', () => grid.enable());
    button('disable', () => grid.disable());
    button('disableRow(1)', () => grid.disableRow(1));
    button('enableRow(1)', () => grid.enableRow(1));
    button('disableRow(3, true)', () => grid.disableRow(3, true));
    button('disableRow(4, false)', () => grid.disableRow(4, false));
    button('enableRow(3, true)', () => grid.enableRow(3, true));
    button('enableRow(4, false)', () => grid.enableRow(4, false));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'row header with checkbox and number',
  () => {
    const { el, grid } = createGrid({
      data,
      columns,
      rowHeaders: ['_number', '_checked'],
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      copyOptions: {
        useFormattedValue: true
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('enable', () => grid.enable());
    button('disable', () => grid.disable());
    button('disableRow(1)', () => grid.disableRow(1));
    button('enableRow(1)', () => grid.enableRow(1));
    button('disableRow(3, true)', () => grid.disableRow(3, true));
    button('disableRow(4, false)', () => grid.disableRow(4, false));
    button('enableRow(3, true)', () => grid.enableRow(3, true));
    button('enableRow(4, false)', () => grid.enableRow(4, false));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
