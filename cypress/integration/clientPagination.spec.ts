import { data } from '../../samples/pagination';
import { cls } from '@/helper/dom';
import { OptRow } from '@/types';

const PER_PAGE_COUNT = 10;

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
      perPage: PER_PAGE_COUNT
    },
    rowHeaders: ['checkbox'],
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
  cy.get(`.tui-page-btn.tui-last-child`).should('to.have.text', '8');
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
  cy.get('.tui-page-btn.tui-last-child').should('to.have.text', '3');
});

it('should reflected total page after appendRow API.', () => {
  cy.gridInstance().invoke('appendRow', appendedData);
  cy.get('.tui-page-btn.tui-last-child').should('to.have.text', '9');
});

it('should reflected total page after prependRow API.', () => {
  cy.gridInstance().invoke('prependRow', appendedData);
  cy.wait(10);
  cy.getCellByIdx(0, 3).should('to.have.text', 'hanjung');
  cy.get('.tui-page-btn.tui-last-child').should('to.have.text', '9');
  compareColumnCellLength(PER_PAGE_COUNT);
});

it('should reflected total page after resetData API.', () => {
  cy.gridInstance().invoke('resetData', [appendedData]);
  cy.wait(10);
  cy.getCellByIdx(0, 3).should('to.have.text', 'hanjung');
  cy.get(`.tui-page-btn.tui-last-child`).should('to.have.text', '1');
  compareColumnCellLength(1);
});

it('should reflected total page after clear API.', () => {
  cy.gridInstance().invoke('clear');
  cy.get(`.tui-page-btn.tui-last-child`).should('to.have.text', '1');
  compareColumnCellLength(0);
});

it('should reflected total page after removeRow API.', () => {
  createGrid(data.slice(0, 61));
  cy.gridInstance().invoke('removeRow', 0);
  cy.get(`.tui-page-btn.tui-last-child`).should('to.have.text', '6');
  compareColumnCellLength(PER_PAGE_COUNT);
});

it('should go to the previous page, If the page disappeared as a result of removeRow', () => {
  createGrid(data.slice(0, 61));
  cy.get(`.tui-page-btn.tui-last-child`).click();
  cy.gridInstance().invoke('removeRow', 60);
  cy.get(`.tui-page-btn.tui-last-child`).should('to.have.text', '6');
  cy.get('.tui-page-btn.tui-is-selected').should('to.have.text', '6');
  compareColumnCellLength(PER_PAGE_COUNT);
});

it('should check only the rows of that page when clicking the checkAll button.', () => {
  createGrid();
  expect(1).to.be.eql(Number('1'));
  cy.get('th input[type=checkbox]').click();
  cy.get('td input[type=checkbox]:checked')
    .its('length')
    .should('be.eq', PER_PAGE_COUNT);
  for (let i = 0; i < 7; i += 1) {
    cy.get(`.tui-page-btn.tui-next`).click();
    cy.get('input[type=checkbox]:checked').should('not.exist');
    cy.wait(10);
  }
});
