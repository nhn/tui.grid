import { OptRow } from '@t/options';
import { PageOptions } from '@t/store/data';
import { data } from '../../samples/pagination';
import { clipboardType, moveToNextPage, setSelectionUsingMouse } from '../helper/util';
import {
  assertFocusedCell,
  assertSelectedRange,
  assertLastPage,
  assertCurrentPage,
  assertFirstPage,
} from '../helper/assert';

const PER_PAGE_COUNT = 10;
const SCROLL_PER_PAGE_COUNT = 50;
const ROW_HEIGHT = 40;
const TOTAL_COUNT = 80;
const LARGE_TOTAL_COUNT = 200;

const columns = [
  { name: 'deliveryType', editor: 'text' },
  { name: 'productOrderNo', editor: 'text' },
  { name: 'orderName', editor: 'text' },
  { name: 'orderId', editor: 'text' },
];

const appendedData = {
  deliveryType: 'Parcel',
  productOrderNo: 100,
  orderName: 'hanjung',
  orderId: 'jj',
};

function createGrid(newData?: OptRow[], pageOptions?: PageOptions) {
  cy.createGrid({
    data: newData || data.slice(0, TOTAL_COUNT),
    pageOptions: {
      useClient: true,
      perPage: PER_PAGE_COUNT,
      ...pageOptions,
    },
    rowHeaders: ['rowNum', 'checkbox'],
    columns,
  });
}

function createGridWithScrollType(newData?: OptRow[]) {
  cy.createGrid({
    data: newData || data.slice(0, LARGE_TOTAL_COUNT),
    bodyHeight: 300,
    pageOptions: {
      useClient: true,
      perPage: SCROLL_PER_PAGE_COUNT,
      type: 'scroll',
    },
    rowHeaders: ['checkbox', 'rowNum'],
    columns,
  });
}

function assertRowLength(length: number) {
  if (length) {
    cy.getRsideBody().find('tr').should('have.length', length);
  } else {
    cy.getRsideBody().find('tr').should('not.exist');
  }
}

function assertCheckedAllRows() {
  cy.get('td input[type=checkbox]').each(($el) => {
    cy.wrap($el).should('be.checked');
  });
}

function assertNotCheckedAllRows(start: number, end: number) {
  for (let i = start; i <= end; i += 1) {
    moveToNextPage();
    cy.get('td input[type=checkbox]').within(($el) => {
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

    assertLastPage(9);
  });

  it('should reflect actual page data after prependRow API.', () => {
    createGrid();
    cy.gridInstance().invoke('prependRow', appendedData);

    assertLastPage(9);
    assertRowLength(PER_PAGE_COUNT);
    cy.getCellByIdx(0, 2).should('have.text', 'hanjung');
  });

  it('should display page data after calling resetData API.', () => {
    createGrid();
    cy.gridInstance().invoke('resetData', [appendedData]);

    cy.getCellByIdx(0, 2).should('have.text', 'hanjung');

    assertLastPage(1);
    assertRowLength(1);
  });

  it('should display page data with moved page after calling resetData API.', () => {
    createGrid();
    moveToNextPage();
    cy.gridInstance().invoke('resetData', [appendedData]);

    cy.getCellByIdx(0, 2).should('have.text', 'hanjung');

    assertLastPage(1);
    assertRowLength(1);
  });

  it('should display page data after calling clear API.', () => {
    createGrid();
    cy.gridInstance().invoke('clear');

    assertLastPage(1);
    assertRowLength(0);
  });

  it('should display page data with moved page after calling clear API.', () => {
    createGrid();
    moveToNextPage();
    cy.gridInstance().invoke('clear');

    assertLastPage(1);
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

    assertLastPage(6);
    assertRowLength(PER_PAGE_COUNT);
  });

  it('should go to the previous page, If the page disappeared as a result of removeRow', () => {
    createGrid(data.slice(0, 61));
    cy.get(`.tui-last-child`).click();
    cy.gridInstance().invoke('removeRow', 60);

    assertLastPage(6);
    assertCurrentPage(6);
    assertRowLength(PER_PAGE_COUNT);
  });

  it('should change page data after calling setPerPage API.', () => {
    createGrid();
    cy.gridInstance().invoke('setPerPage', 20);

    assertLastPage(4);
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

    cy.getByCls('body-container')
      .invoke('height')
      .then((height) => {
        initialHeight.should('eq', height);
      });
  });

  it('should check the header checkbox of added data on scrolling at the bottommost', () => {
    createGridWithScrollType();

    cy.gridInstance().invoke('checkAll', false);

    // scroll at the bottommost
    cy.focusAndWait(49, 'productOrderNo');

    cy.getHeaderCell('_checked').find('input').should('not.be.checked');
  });

  it('should display the appended row after removing all rows', () => {
    createGridWithScrollType();

    // remove all checked rows
    cy.gridInstance().invoke('checkAll', true);
    cy.gridInstance().invoke('removeCheckedRows');

    cy.gridInstance().invoke('appendRow', appendedData);

    cy.getCellByIdx(0, 2).should('have.text', 'hanjung');
  });
});

describe('API', () => {
  beforeEach(() => {
    createGrid();
  });

  it('should recaluclate pagination size after setPaginationTotalCount API', () => {
    cy.gridInstance().invoke('setPaginationTotalCount', 20);

    assertLastPage(2);
  });

  it('should get pagination size after getPaginationTotalCount API', () => {
    cy.gridInstance().invoke('getPaginationTotalCount').should('eq', TOTAL_COUNT);
  });
});

describe('event', () => {
  beforeEach(() => {
    createGrid();
  });

  it('should trigger beforePageMove event before moving page', () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'beforePageMove', callback);

    moveToNextPage();

    cy.wrap(callback).should('be.calledWithMatch', { page: 2 });
  });

  it('should trigger afterPageMove event after moving page', () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'afterPageMove', callback);

    moveToNextPage();

    cy.wrap(callback).should('be.calledWithMatch', { page: 2 });
  });
});

it('should apply the pageState after calling resetData with pageState option', () => {
  createGrid();

  const pageState = { page: 2, totalCount: 20, perPage: 5 };

  cy.gridInstance().invoke('resetData', data, { pageState });

  assertCurrentPage(2);
  assertLastPage(4);
  assertRowLength(5);
});

describe('with tui-pagination option', () => {
  it('visiblePages option', () => {
    createGrid(data.slice(0, 100), { visiblePages: 5 });

    assertLastPage('...');
    cy.get('.tui-last-child').prev().should('have.text', '5');
  });

  it('centerAlign option', () => {
    createGrid(data.slice(0, 100), { visiblePages: 5, centerAlign: true, page: 4 });

    assertFirstPage('...');
    assertLastPage('...');
  });

  it('firstItemClassName, lastItemClassName option', () => {
    createGrid(data.slice(0, 100), {
      firstItemClassName: 'my-first-item',
      lastItemClassName: 'my-last-item',
    });

    cy.get('.my-first-item').should('have.text', '1');
    cy.get('.my-last-item').should('have.text', '10');
  });

  it('template option', () => {
    createGrid(data.slice(0, 100), {
      template: {
        page: '<a href="#" class="tui-page-btn">{{page}}p</a>',
        currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}p</strong>',
      },
    });

    assertCurrentPage('1p');
    assertLastPage('10p');
  });
});

describe('focus', () => {
  beforeEach(() => {
    createGrid();
    moveToNextPage();
  });

  it('should focus the cell considering the pagination', () => {
    cy.getCell(17, 'deliveryType').click();

    assertFocusedCell('deliveryType', 17);
  });

  it('should move the focused cell by arrow key', () => {
    cy.gridInstance().invoke('focus', 17, 'deliveryType');

    clipboardType('{uparrow}');

    assertFocusedCell('deliveryType', 16);

    clipboardType('{rightarrow}');

    assertFocusedCell('productOrderNo', 16);

    clipboardType('{downarrow}');

    assertFocusedCell('productOrderNo', 17);

    clipboardType('{leftarrow}');

    assertFocusedCell('deliveryType', 17);
  });
});

describe('editing', () => {
  beforeEach(() => {
    createGrid();
    moveToNextPage();
  });

  ['mouse', 'keyMap'].forEach((type) => {
    it(`should edit the cell considering the pagination by ${type}`, () => {
      if (type === 'mouse') {
        cy.getCell(17, 'productOrderNo').click().trigger('dblclick');
      } else {
        cy.gridInstance().invoke('focus', 17, 'productOrderNo');
        clipboardType('{enter}');
      }

      cy.gridInstance()
        .invoke('getValue', 17, 'productOrderNo')
        .then((value) => {
          cy.getByCls('content-text').should('have.value', value);
        });
    });
  });
});

describe('body selection', () => {
  beforeEach(() => {
    createGrid();
    moveToNextPage();
    setSelectionUsingMouse([5, 0], [7, 1]);
  });

  it('should move the selection area by keyMap', () => {
    clipboardType('{shift}{rightarrow}');

    assertSelectedRange({ start: [5, 0], end: [7, 2] });

    clipboardType('{shift}{downarrow}');

    assertSelectedRange({ start: [5, 0], end: [8, 2] });

    clipboardType('{shift}{leftarrow}');

    assertSelectedRange({ start: [5, 0], end: [8, 1] });

    clipboardType('{shift}{uparrow}');

    assertSelectedRange({ start: [5, 0], end: [7, 1] });
  });

  it('should remove the selection area data by keyMap', () => {
    clipboardType('{del}');

    cy.getCellByIdx(5, 0).should('have.text', '');
    cy.getCellByIdx(5, 1).should('have.text', '');
    cy.getCellByIdx(6, 0).should('have.text', '');
    cy.getCellByIdx(6, 1).should('have.text', '');
    cy.getCellByIdx(7, 0).should('have.text', '');
    cy.getCellByIdx(7, 1).should('have.text', '');
  });
});

describe('header, row header selection', () => {
  beforeEach(() => {
    createGrid();
    moveToNextPage();
  });

  it('should select the cells and focus the cell with header selection', () => {
    cy.getHeaderCell('deliveryType').click();

    assertFocusedCell('deliveryType', 10);
    assertSelectedRange({ start: [0, 0], end: [9, 0] });
  });

  it('should select the cells and focus the cell with row header selection', () => {
    cy.getRowHeaderCell(17, '_number').click();

    assertFocusedCell('deliveryType', 17);
    assertSelectedRange({ start: [7, 0], end: [7, 3] });
  });
});
