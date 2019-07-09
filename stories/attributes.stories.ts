import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid, OptRow } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';
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

function createButtons(grid) {
  button('enable', () => grid.enable());
  button('disable', () => grid.disable());
  button('enableRow(1)', () => grid.enableRow(1));
  button('disableRow(1)', () => grid.disableRow(1));
  button('enableRow(3, true)', () => grid.enableRow(3, true));
  button('disableRow(3, true)', () => grid.disableRow(3, true));
  button('enableRow(4, false)', () => grid.enableRow(4, false));
  button('disableRow(4, false)', () => grid.disableRow(4, false));
}

function createDataWithCheckAttr(): OptRow[] {
  const optRows: OptRow[] = data.slice();
  optRows[0]._attributes = { disabled: true };
  optRows[1]._attributes = {
    checkDisabled: true
  };
  optRows[2]._attributes = {
    disabled: true,
    checkDisabled: false
  };

  return optRows;
}

function createDataWithClassNameAttr(): OptRow[] {
  const optRows: OptRow[] = data.slice();
  optRows[0]._attributes = {
    className: {
      row: ['row-test-a']
    }
  };
  optRows[1]._attributes = {
    className: {
      column: { type: ['column-test-a'], genre: ['column-test-b'] }
    }
  };
  optRows[2]._attributes = {
    className: {
      row: ['row-test-a'],
      column: { name: ['column-test-a'], genre: ['column-test-b'] }
    }
  };

  return optRows;
}

stories.add(
  'basic',
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

    createButtons(grid);

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'row header with checkbox',
  () => {
    const { el, grid } = createGrid({
      data: createDataWithCheckAttr(),
      columns,
      rowHeaders: ['checkbox'],
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

    createButtons(grid);
    button('enableRowCheck(5)', () => grid.enableRowCheck(5));
    button('disableRowCheck(5)', () => grid.disableRowCheck(5));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'row header with checkbox and number',
  () => {
    const { el, grid } = createGrid({
      data: createDataWithCheckAttr(),
      columns,
      rowHeaders: ['rowNum', 'checkbox'],
      bodyHeight: 'fitToParent',
      columnOptions: {
        frozenCount: 2,
        minWidth: 150,
        resizable: true
      },
      copyOptions: {
        useFormattedValue: true
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);
    rootEl.style.height = '400px';

    createButtons(grid);
    button('enableRowCheck(5)', () => grid.enableRowCheck(5));
    button('disableRowCheck(5)', () => grid.disableRowCheck(5));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'className',
  () => {
    const { el, grid } = createGrid({
      data: createDataWithClassNameAttr(),
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
    .row-test-a {
      color: yellow;
    }
    .column-test-a {
      color: skyblue;
    }
    .column-test-b {
      color: green;
    }
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

    button("addCellClassName(2, 'name', 'tui-grid-cell-test')", () =>
      grid.addCellClassName(2, 'artist', 'tui-grid-cell-test')
    );
    button("removeCellClassName(2, 'name', 'tui-grid-cell-test')", () =>
      grid.removeCellClassName(2, 'artist', 'tui-grid-cell-test')
    );
    button("addRowClassName(1, 'tui-grid-row-test')", () =>
      grid.addRowClassName(3, 'tui-grid-row-test')
    );
    button("removeRowClassName(1, 'tui-grid-row-test')", () =>
      grid.removeRowClassName(3, 'tui-grid-row-test')
    );

    (window as Window & { grid: Grid }).grid = grid;

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
