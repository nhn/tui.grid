import { cls, dataAttr } from '@/helper/dom';

const RESIZER_HALF_WIDTH = 3;
const CELL_BORDER_WIDTH = 1;

Cypress.Commands.add('getCell', (rowKey, columnName) => {
  return cy.get(
    `.${cls('cell')}[${dataAttr.ROW_KEY}="${rowKey}"][${dataAttr.COLUMN_NAME}="${columnName}"]`
  );
});

Cypress.Commands.add('getCellByIdx', (rowIdx, columnIdx, side = 'R') => {
  const sideCls = cls(side === 'R' ? 'rside-area' : 'lside-area');
  return cy.get(
    `.${sideCls} .${cls('body-area')} tr:nth-child(${rowIdx + 1}) td:nth-child(${columnIdx + 1})`
  );
});

Cypress.Commands.add('getCellContent', (rowKey, columnName) => {
  return cy.getCell(rowKey, columnName).find(`> .${cls('cell-content')}`);
});

Cypress.Commands.add('getByCls', (...names) => {
  return cy.get(names.map(name => `.${cls(name)}`).join(' '));
});

Cypress.Commands.add('getByTestId', testId => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('createGrid', (gridOptions, containerStyle = {}, parentEl = null) => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  return cy.window().then(win => {
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

    win.grid = new tui.Grid({ el, ...gridOptions });

    return new Promise(resolve => {
      requestAnimationFrame(() => {
        resolve(win.grid);
      });
    });
  });
});

Cypress.Commands.add('gridInstance', () => {
  return cy.window().its('grid');
});

Cypress.Commands.add('createStyle', (style = '') => {
  return cy.window().then(win => {
    const { document } = win;
    const styleElement = document.createElement('style');
    styleElement.innerHTML = style;
    document.head.appendChild(styleElement);
  });
});

Cypress.Commands.add('getHeaderCell', columnName => {
  return cy.get(`.${cls('cell-header')}[${dataAttr.COLUMN_NAME}="${columnName}"]`);
});

Cypress.Commands.add('getRowHeaderCell', rowKey => {
  return cy.get(`.${cls('cell-row-header')}[${dataAttr.ROW_KEY}="${rowKey}"]`);
});

Cypress.Commands.add('getColumnCells', columnName => {
  return cy.get(`td[data-column-name=${columnName}]`);
});

Cypress.Commands.add('getRow', rowKey => {
  return cy.get(`td[data-row-key=${rowKey}]`);
});

Cypress.Commands.add('getRsideBody', () => {
  return cy.getByCls('rside-area', 'body-area');
});

Cypress.Commands.add('dragColumnResizeHandle', (index, distance) => {
  cy.getByCls('column-resize-handle')
    .eq(index)
    .trigger('mousedown')
    .then($el => {
      const { left, top } = $el.offset();
      const pageX = left + distance + CELL_BORDER_WIDTH + RESIZER_HALF_WIDTH;
      const pageY = top;

      cy.root().trigger('mousemove', { pageX, pageY });
    })
    .trigger('mouseup');
});
