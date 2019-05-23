import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('ClassName', module);
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
  'className change',
  () => {
    const { el, grid } = createGrid({
      data,
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

    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
    .tui-grid-cell-test {
      color: blue;
      background-color: #ff6666;
    }
    .tui-grid-row-test {
      color: red;
      background-color: #666666;
    }
    `;
    rootEl.appendChild(styleElement);

    button("addCellClassName(0, 'name', 'tui-grid-cell-test')", () =>
      grid.addCellClassName(0, 'name', 'tui-grid-cell-test')
    );
    button("addRowClassName(1, 'tui-grid-row-test')", () =>
      grid.addRowClassName(1, 'tui-grid-row-test')
    );
    button("addRowClassName(1, 'tui-grid-row-test')", () =>
      grid.addRowClassName(1, 'tui-grid-row-test')
    );
    button("removeCellClassName(0, 'type', 'tui-grid-cell-test')", () =>
      grid.removeCellClassName(0, 'type', 'tui-grid-cell-test')
    );
    button("removeRowClassName(1, 'tui-grid-row-test')", () =>
      grid.removeRowClassName(1, 'tui-grid-row-test')
    );

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
