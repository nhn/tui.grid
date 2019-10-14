import { data } from '../../samples/pagination';
import { cls } from '@/helper/dom';
import { OptRow } from '@/types';

const columns = [
  { name: 'deliveryType', sortable: true, sortingType: 'desc', filter: 'text' },
  { name: 'productOrderNo' },
  { name: 'orderName' },
  { name: 'orderId' }
];

const appendedData = {
  deliveryType: '택배',
  productOrderNo: 100,
  orderName: 'hanjung',
  orderId: 'jj'
};

function createGrid(newData?: OptRow[]) {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });

  cy.createGrid({
    data: newData || data.slice(0, 80),
    pageOptions: {
      useClient: true,
      perPage: 10
    },
    rowHeaders: ['rowNum'],
    columns
  });
}

function compareColumnCellLength(length: number) {
  if (length) {
    // rowHeader cell length
    const columnLength = columns.length + 1;
    cy.get(`td.${cls('cell')}`)
      .its('length')
      .should('be.eq', length * columnLength);
  } else {
    cy.get(`td.${cls('cell')}`).should('not.exist');
  }
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  createGrid();
});

it('should displayed page according to the number of data.', () => {
  cy.get(`.tui-page-btn.tui-last-child`).contains('8');
});

it('should maintain sorting even if move the page.', () => {
  cy.get(`.${cls('btn-sorting')}`).click();

  cy.get(`a.tui-page-btn`)
    .first()
    .click();

  cy.get(`.${cls('btn-sorting')}`)
    .first()
    .should('have.class', cls('btn-sorting-down'));
});

it('should reflected total page after filtering.', () => {
  cy.get(`.${cls('btn-filter')}`).click();
  cy.get(`.${cls('filter-input')}`).type('택배');
  cy.get(`.tui-page-btn.tui-last-child`).contains('3');
});

it('should reflected total page after appendRow API.', () => {
  cy.gridInstance().invoke('appendRow', appendedData);
  cy.get(`.tui-page-btn.tui-last-child`).contains('9');
});

it('should reflected total page after prependRow API.', () => {
  cy.gridInstance().invoke('prependRow', appendedData);
  cy.get('[data-column-name=orderName]')
    .eq(1)
    .contains('hanjung');
  cy.get(`.tui-page-btn.tui-last-child`).contains('9');
  compareColumnCellLength(10);
});

it('should reflected total page after resetData API.', () => {
  cy.gridInstance().invoke('resetData', [appendedData]);
  cy.get('[data-column-name=orderName]')
    .eq(1)
    .contains('hanjung');
  cy.get(`.tui-page-btn.tui-last-child`).contains('1');
  compareColumnCellLength(1);
});

it('should reflected total page after clear API.', () => {
  cy.gridInstance().invoke('clear');
  cy.get(`.tui-page-btn.tui-last-child`).contains('1');
  compareColumnCellLength(0);
});

it('should reflected total page after removeRow API.', () => {
  createGrid(data.slice(0, 61));
  cy.gridInstance().invoke('removeRow', 0);
  cy.get(`.tui-page-btn.tui-last-child`).contains('6');
  compareColumnCellLength(10);
});

it('should go to the previous page, If the page disappeared as a result of removeRow', () => {
  createGrid(data.slice(0, 61));
  cy.get(`.tui-page-btn.tui-last-child`).click();
  cy.gridInstance().invoke('removeRow', 60);
  cy.get(`.tui-page-btn.tui-last-child`).contains('6');
  cy.get('.tui-page-btn.tui-is-selected').contains('6');
  compareColumnCellLength(10);
});
