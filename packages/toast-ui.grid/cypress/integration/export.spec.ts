import * as Export from '@/dispatch/export';
import { cls } from '@/helper/dom';
import { RowKey } from '@t/store/data';

before(() => {
  cy.visit('/dist');
});

function showContextMenu(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).trigger('contextmenu');
}

function getMenuItemByText(text: string) {
  return cy.contains(`.${cls('context-menu')} .menu-item`, text);
}

describe('export data', () => {
  it('should get data according to defulat export option', () => {
    const data = [
      { name: 'Sugar', artist: 'Maroon5' },
      { name: 'Get Lucky', artist: 'Daft Punk' },
      { name: '21', artist: 'Adele' },
    ];

    const columns = [
      {
        header: 'Name',
        name: 'name',
      },
      {
        header: 'Artist',
        name: 'artist',
      },
    ];

    cy.createGrid({ data, columns });

    showContextMenu(0, 'name');
    getMenuItemByText('Export').trigger('mouseenter');
    getMenuItemByText('CSV Export').click();

    expect(Export.exportCsv).to.be.called;
  });
});
