import { cls, dataAttr } from '@/helper/dom';

Cypress.Commands.add('getCell', (rowKey, columnName) => {
  return cy.get(
    `.${cls('cell')}[${dataAttr.ROW_KEY}="${rowKey}"][${dataAttr.COLUMN_NAME}="${columnName}"]`
  );
});

Cypress.Commands.add('getCellByIdx', (rowIdx, columnIdx) => {
  return cy
    .get(`.${cls('body-area')} tr:nth-child(${rowIdx + 1})`)
    .find(`.${cls('cell')}`)
    .eq(columnIdx);
});

Cypress.Commands.add('getCellContent', (rowKey, columnName) => {
  return cy.getCell(rowKey, columnName).find(`> .${cls('cell-content')}`);
});

Cypress.Commands.add('createGrid', (gridOptions, containerStyle = {}) => {
  return cy.window().then(win => {
    const { document, tui } = win;
    const el = document.createElement('div');
    const styles = { width: '800px', ...containerStyle };

    Object.assign(el.style, styles);
    document.body.appendChild(el);

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
