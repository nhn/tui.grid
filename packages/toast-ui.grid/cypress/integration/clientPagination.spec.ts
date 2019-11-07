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
  deliveryType: 'Parcel',
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
    cy.get(`td.${cls('cell')}`).should('have.length', length * columnLength);
  } else {
    cy.get(`td.${cls('cell')}`).should('not.exist');
  }
}

function checkLastPage(page: string) {
  cy.get('.tui-last-child').should('to.have.text', page);
}

function checkSelectedPage(page: string) {
  cy.get('.tui-is-selected').should('to.have.text', page);
}

function allRowsCheckboxChecked() {
  cy.get('td input[type=checkbox]').within($el => {
    expect($el.is(':checked')).to.be.true;
  });
}

function allRowsCheckboxNotChecked(start: number, end: number) {
  for (let i = 0; i < start; i += 1) {
    cy.get(`.tui-page-btn.tui-next`).click();
  }

  for (let i = start; i < end; i += 1) {
    cy.get('td input[type=checkbox]').within($el => {
      expect($el.is(':checked')).not.to.be.true;
    });
    cy.get(`.tui-page-btn.tui-next`).click();
    cy.wait(10);
  }
}

before(() => {
  cy.visit('/dist');
});

it('should displayed page according to the number of data.', () => {
  createGrid();
  cy.get(`.tui-last-child`).should('to.have.text', '8');
});

it('should maintain sorting even if move the page.', () => {
  createGrid();
  cy.getByCls('btn-sorting').click();

  cy.get(`a.tui-page-btn`)
    .first()
    .click();

  cy.getByCls('btn-sorting')
    .first()
    .should('have.class', cls('btn-sorting-down'));
});

it('should reflect actual page data after filtering.', () => {
  createGrid();
  cy.getByCls('btn-filter').click();
  cy.getByCls('filter-input').type('Parcel');

  checkLastPage('3');
});

it('should reflect actual page data after appendRow API.', () => {
  createGrid();
  cy.gridInstance().invoke('appendRow', appendedData);

  checkLastPage('9');
});

it('should reflect actual page data after prependRow API.', () => {
  createGrid();

  cy.gridInstance().invoke('prependRow', appendedData);

  cy.getCellByIdx(0, 2).should('have.text', 'hanjung');

  checkLastPage('9');
  compareColumnCellLength(PER_PAGE_COUNT);
});

it('should reflect actual page data after resetData API.', () => {
  createGrid();
  cy.gridInstance().invoke('resetData', [appendedData]);

  cy.getCellByIdx(0, 2).should('have.text', 'hanjung');

  checkLastPage('1');
  compareColumnCellLength(1);
});

it('should reflect actual page data after clear API.', () => {
  createGrid();
  cy.gridInstance().invoke('clear');

  checkLastPage('1');
  compareColumnCellLength(0);
});

it('should reflect actual page data after removeRow API.', () => {
  createGrid(data.slice(0, 61));
  cy.gridInstance().invoke('removeRow', 0);

  checkLastPage('6');
  compareColumnCellLength(PER_PAGE_COUNT);
});

it('should go to the previous page, If the page disappeared as a result of removeRow', () => {
  createGrid(data.slice(0, 61));
  cy.get(`.tui-last-child`).click();
  cy.gridInstance().invoke('removeRow', 60);

  checkLastPage('6');
  checkSelectedPage('6');
  compareColumnCellLength(PER_PAGE_COUNT);
});

it('should check only the rows of that page when clicking the checkAll button.', () => {
  createGrid();
  cy.get('th input[type=checkbox]').click();

  allRowsCheckboxChecked();
  allRowsCheckboxNotChecked(1, 7);
});
