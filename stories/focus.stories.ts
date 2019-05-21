import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Focus', module);
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
  'Focus Activation',
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

    button('getFocusedCell()', () => {
      alert(`
        ${grid.getFocusedCell().columnName}, 
        ${grid.getFocusedCell().rowKey},
        ${grid.getFocusedCell().value}
        `);
    });
    button('blur()', () => grid.blur());
    button(`focus(1, 'type')`, () => grid.focus(1, 'type'));
    button(`focus(2, 'release')`, () => grid.focus(2, 'release'));
    button(`focusAt(0, 0)`, () => grid.focusAt(0, 0));
    button(`focusAt(1, 1)`, () => grid.focusAt(1, 1));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
