import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Clipboard', module);
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
  'clipboard',
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

    button('copyToClipboard', () => grid.copyToClipboard());

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
