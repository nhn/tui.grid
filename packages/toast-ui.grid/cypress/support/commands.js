import { cls, dataAttr } from '@/helper/dom';
import { deepCopyArray } from '@/helper/common';

const RESIZER_HALF_WIDTH = 3;
const CELL_BORDER_WIDTH = 1;

Cypress.Commands.add('getCell', (rowKey, columnName) =>
  cy.get(
    `.${cls('cell')}[${dataAttr.ROW_KEY}="${rowKey}"][${dataAttr.COLUMN_NAME}="${columnName}"]`
  )
);

Cypress.Commands.add('getCellByIdx', (rowIdx, columnIdx, side = 'R') => {
  const sideCls = cls(side === 'R' ? 'rside-area' : 'lside-area');
  return cy.get(
    `.${sideCls} .${cls('body-area')} tr:nth-child(${rowIdx + 1}) td:nth-child(${columnIdx + 1})`
  );
});

Cypress.Commands.add('getByCls', (...names) =>
  cy.get(names.map((name) => `.${cls(name)}`).join(' '))
);

Cypress.Commands.add('getByTestId', (testId) => cy.get(`[data-testid="${testId}"]`));

Cypress.Commands.add('createGrid', (gridOptions, containerStyle = {}, parentEl = null) => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
  return cy.window().then((win) => {
    const { document, tui } = win;
    const el = document.createElement('div');
    const styles = { width: '800px', ...containerStyle };

    if (parentEl) {
      parentEl.appendChild(el);
      document.body.appendChild(parentEl);
      cy.wait(10);
    } else {
      Object.assign(el.style, styles);
      document.body.appendChild(el);
    }

    if (gridOptions.theme) {
      const { preset, extOptions } = gridOptions.theme;

      tui.Grid.applyTheme(preset, extOptions);
      delete gridOptions.theme;
    }

    if (Array.isArray(gridOptions.data)) {
      gridOptions.data = deepCopyArray(gridOptions.data);
    }

    win.grid = new tui.Grid({ el, ...gridOptions });

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve(win.grid);
      });
    });
  });
});

Cypress.Commands.add('gridInstance', () => cy.window().its('grid'));

Cypress.Commands.add('createStyle', (style = '') => {
  return cy.window().then((win) => {
    const { document } = win;
    const styleElement = document.createElement('style');
    styleElement.innerHTML = style;
    document.head.appendChild(styleElement);
  });
});

Cypress.Commands.add('getHeaderCell', (columnName) =>
  cy.get(`.${cls('cell-header')}[${dataAttr.COLUMN_NAME}="${columnName}"]`)
);

Cypress.Commands.add('getRowHeaderCell', (rowKey, columnName) =>
  cy.get(
    `.${cls('cell-row-header')}[${dataAttr.ROW_KEY}="${rowKey}"][${
      dataAttr.COLUMN_NAME
    }="${columnName}"]`
  )
);

Cypress.Commands.add('getRowHeaderInput', (rowKey) =>
  cy.get(`.${cls('cell-row-header')}[${dataAttr.ROW_KEY}="${rowKey}"] input`)
);

Cypress.Commands.add('getRowHeaderCells', (columnName) => {
  return cy.get(`td[data-column-name=${columnName}]`);
});

Cypress.Commands.add('getColumnCells', (columnName) =>
  cy.get(`td[data-column-name=${columnName}]`)
);

Cypress.Commands.add('getRow', (rowKey) => cy.get(`td[data-row-key=${rowKey}]`).parent());

Cypress.Commands.add('getCells', (rowKey) => cy.get(`td[data-row-key=${rowKey}]`));

Cypress.Commands.add('getRsideBody', () => cy.getByCls('rside-area', 'body-area'));

Cypress.Commands.add('getRsideHeader', () => cy.getByCls('rside-area', 'header-area'));

Cypress.Commands.add('dragColumnResizeHandle', (index, distance) => {
  cy.getByCls('column-resize-handle')
    .eq(index)
    .trigger('mousedown')
    .then(($el) => {
      const { left, top } = $el.offset();
      const pageX = left + distance + CELL_BORDER_WIDTH + RESIZER_HALF_WIDTH;
      const pageY = top;

      cy.root().trigger('mousemove', { pageX, pageY });
    })
    .trigger('mouseup');
});

Cypress.Commands.add('getBodyCells', () => cy.get(`td.${cls('cell')}`));

Cypress.Commands.add('focusAndWait', (rowKey, columnName) => {
  cy.gridInstance().invoke('focus', rowKey, columnName);
  cy.wait(100);
});

Cypress.Commands.add('destroyGrid', () => {
  return cy.window().then((win) => {
    delete win.grid;
  });
});
