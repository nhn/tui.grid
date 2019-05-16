import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Selection', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name' },
  { name: 'artist' },
  { name: 'type' },
  { name: 'release' },
  { name: 'genre' },
  { name: 'genreCode' },
  { name: 'grade' },
  { name: 'price' },
  { name: 'downloadCount' },
  { name: 'listenCount' }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add(
  'Selection Activation',
  () => {
    const { el, grid } = createGrid({
      data,
      columns,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    button('selection({ start: 1, 2, end: 3, 4 })', () =>
      grid.selection({ start: [1, 2], end: [3, 4] })
    );

    button('selection({ start: 3, 5, end: 1, 2 })', () =>
      grid.selection({ start: [3, 5], end: [1, 2] })
    );

    button('selection({ start: -1, -1, end: 20, 20 })', () =>
      grid.selection({ start: [-1, -1], end: [20, 20] })
    );

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'Row Selection',
  () => {
    const { el } = createGrid({
      data,
      columns,
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150
      },
      selectionUnit: 'row'
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
