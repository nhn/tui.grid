import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Attributes', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', editor: 'text' },
  { name: 'artist', editor: 'text' },
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
  'enable/disable',
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
    button('enableRow(1)', () => grid.enableRow(1));
    button('disableRow(2)', () => grid.disableRow(2));
    button('enableCheck(3)', () => grid.enableCheck(3));
    button('disableCheck(4)', () => grid.disableCheck(4));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
