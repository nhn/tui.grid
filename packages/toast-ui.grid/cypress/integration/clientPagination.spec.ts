import { data } from '../../samples/pagination';
import { OptRow } from '@t/options';

const PER_PAGE_COUNT = 10;
const SCROLL_PER_PAGE_COUNT = 50;
const ROW_HEIGHT = 40;

const columns = [
  { name: 'deliveryType' },
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

function createGridWithScrollType(newData?: OptRow[]) {
  cy.createGrid({
    data: newData || data.slice(0, 200),
    bodyHeight: 300,
    pageOptions: {
      useClient: true,
      perPage: SCROLL_PER_PAGE_COUNT,
      type: 'scroll'
    },
    rowHeaders: ['checkbox', 'rowNum'],
    columns
  });
}

function moveToNextPage() {
  cy.get('.tui-page-btn.tui-next').click({ force: true });
}

function assertRowLength(length: number) {
  if (length) {
    cy.getRsideBody()
      .find('tr')
      .should('have.length', length);
  } else {
    cy.getRsideBody()
      .find('tr')
      .should('not.exist');
  }
}

function assertLastPage(page: string) {
  cy.get('.tui-last-child').should('have.text', page);
}

function assertSelectedPage(page: string) {
  cy.get('.tui-is-selected').should('have.text', page);
}

function assertCheckedAllRows() {
  cy.get('td input[type=checkbox]').each($el => {
    cy.wrap($el).should('be.checked');
  });
}

function assertNotCheckedAllRows(start: number, end: number) {
  for (let i = start; i <= end; i += 1) {
    moveToNextPage();
    cy.get('td input[type=checkbox]').within($el => {
      expect($el).not.to.be.checked;
    });
  }
}

before(() => {
  cy.visit('/dist');
});

describe('type: pagination', () => {
  it('should displayed page according to the number of data.', () => {
    createGrid();
    cy.get(`.tui-last-child`).should('have.text', '8');
  });

  it('should reflect actual page data after appendRow API.', () => {
    createGrid();
    cy.gridInstance().invoke('appendRow', appendedData);

    assertLastPage('9');
  });

  it('should reflect actual page data after prependRow API.', () => {
    createGrid();
    cy.gridInstance().invoke('prependRow', appendedData);

    assertLastPage('9');
    assertRowLength(PER_PAGE_COUNT);
    cy.getCellByIdx(0, 2).should('have.text', 'hanjung');
  });

  it('should display page data after calling resetData API.', () => {
    createGrid();
    cy.gridInstance().invoke('resetData', [appendedData]);

    cy.getCellByIdx(0, 2).should('have.text', 'hanjung');

    assertLastPage('1');
    assertRowLength(1);
  });

  it('should display page data with moved page after calling resetData API.', () => {
    createGrid();
    moveToNextPage();
    cy.gridInstance().invoke('resetData', [appendedData]);

    cy.getCellByIdx(0, 2).should('have.text', 'hanjung');

    assertLastPage('1');
    assertRowLength(1);
  });

  it('should display page data after calling clear API.', () => {
    createGrid();
    cy.gridInstance().invoke('clear');

    assertLastPage('1');
    assertRowLength(0);
  });

  it('should display page data with moved page after calling clear API.', () => {
    createGrid();
    moveToNextPage();
    cy.gridInstance().invoke('clear');

    assertLastPage('1');
    assertRowLength(0);
  });

  it('should check only the rows of that page when clicking the checkAll button.', () => {
    createGrid();
    cy.get('th input[type=checkbox]').click();

    assertCheckedAllRows();
    assertNotCheckedAllRows(1, 7);
  });

  it('should reflect actual page data after removeRow API.', () => {
    createGrid(data.slice(0, 61));
    cy.gridInstance().invoke('removeRow', 0);

    assertLastPage('6');
    assertRowLength(PER_PAGE_COUNT);
  });

  it('should go to the previous page, If the page disappeared as a result of removeRow', () => {
    createGrid(data.slice(0, 61));
    cy.get(`.tui-last-child`).click();
    cy.gridInstance().invoke('removeRow', 60);

    assertLastPage('6');
    assertSelectedPage('6');
    assertRowLength(PER_PAGE_COUNT);
  });

  it('should change page data after calling setPerPage API.', () => {
    createGrid();
    cy.gridInstance().invoke('setPerPage', 20);

    assertLastPage('4');
    assertRowLength(20);
  });
});

describe('type: scroll', () => {
  it('should add next data on scrolling at the bottommost', () => {
    createGridWithScrollType();

    cy.getByCls('body-container')
      .invoke('height')
      .should('eq', SCROLL_PER_PAGE_COUNT * ROW_HEIGHT + 1);

    // scroll at the bottommost
    cy.focusAndWait(49, 'productOrderNo');

    cy.getRowHeaderCell(50, '_number').should('have.text', '51');
    cy.getByCls('body-container')
      .invoke('height')
      .should('eq', SCROLL_PER_PAGE_COUNT * ROW_HEIGHT * 2 + 1);
  });

  it('should not change page data after calling setPerPage API', () => {
    createGridWithScrollType();

    const initialHeight = cy.getByCls('body-container').invoke('height');

    cy.gridInstance().invoke('setPerPage', 30);

    setTimeout(() => {
      cy.getByCls('body-container')
        .invoke('height')
        .then(height => {
          initialHeight.should('eq', height);
        });
    });
  });

  it('should check the header checkbox of added data on scrolling at the bottommost', () => {
    createGridWithScrollType();

    cy.gridInstance().invoke('checkAll', false);

    // scroll at the bottommost
    cy.focusAndWait(49, 'productOrderNo');

    cy.getHeaderCell('_checked')
      .find('input')
      .should('not.be.checked');
  });
});
