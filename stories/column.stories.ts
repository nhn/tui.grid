import { storiesOf, addParameters } from '@storybook/html';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import { withKnobs, button, number, boolean } from '@storybook/addon-knobs';
import '../src/css/grid.css';

addParameters({ html: { preventForceRender: false } });
const stories = storiesOf('Columns', module);
stories.addDecorator(withKnobs);

const columns = [
  { name: 'name', minWidth: 150 },
  { name: 'artist', minWidth: 150 },
  { name: 'type', minWidth: 300 },
  { name: 'release', minWidth: 300 },
  { name: 'genre', minWidth: 300 }
];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });
  return { el, grid };
}

stories.add(
  'frozenCount',
  () => {
    const { grid, el } = createGrid({
      data,
      columns,
      bodyHeight: 400,
      columnOptions: {
        frozenCount: 2
      }
    });

    button('setFrozenColumnCount(1)', () => grid.setFrozenColumnCount(1));
    button('setFrozenColumnCount(2)', () => grid.setFrozenColumnCount(2));
    button('setFrozenColumnCount(3)', () => grid.setFrozenColumnCount(3));

    return el;
  },
  { html: { preventForceRender: true } }
);

stories.add('frozenBorderWidth', () => {
  const numberOptions = { range: true, min: 1, max: 10 };
  const frozenBorderWidth = number('frozenBorderWidth', 1, numberOptions);

  const { el } = createGrid({
    data,
    columns,
    bodyHeight: 400,
    columnOptions: {
      frozenCount: 2,
      frozenBorderWidth
    }
  });

  return el;
});

stories.add(
  'show/hide column',
  () => {
    const { grid, el } = createGrid({
      data,
      columns,
      bodyHeight: 400,
      columnOptions: { frozenCount: 2 }
    });

    button(`hideColumn('type')`, () => grid.hideColumn('type'));
    button(`showColumn('type')`, () => grid.showColumn('type'));
    button(`hideColumn('artist')`, () => grid.hideColumn('artist'));
    button(`showColumn('artist')`, () => grid.showColumn('artist'));

    return el;
  },
  { html: { preventForceRender: true } }
);
