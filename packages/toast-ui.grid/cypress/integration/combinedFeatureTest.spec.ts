import { data } from '../../samples/pagination';
import { cls, ClassNameType } from '@/helper/dom';
import { OptRow } from '@/types';

const PER_PAGE_COUNT = 10;
const columns = [
  { name: 'deliveryType', sortable: true, sortingType: 'desc', filter: 'text' },
  { name: 'orderName', sortable: true }
];

function createGridWithPagination(newData?: OptRow[]) {
  cy.createGrid({
    data: newData || data.slice(0, 20),
    pageOptions: {
      useClient: true,
      perPage: PER_PAGE_COUNT
    },
    columns
  });
}

function createGrid() {
  cy.createGrid({
    data: data.slice(0, 20),
    columns
  });
}

// @TODO: need to unify the duplicated assert function in sort.spec.ts, filter.spec.ts, clientPagination.spec.ts
function assertColumnData(column: string, text: string) {
  cy.getColumnCells(column).should('sameColumnData', text);
}

function assertHaveSortingBtnClass(className: ClassNameType) {
  cy.getByCls('btn-sorting').should('have.class', cls(className));
}

function assertHaveNotSortingBtnClass(className: ClassNameType) {
  cy.getByCls('btn-sorting').should('have.not.class', cls(className));
}

function assertActiveFilterBtn() {
  cy.getByCls('btn-filter').should('have.class', cls('btn-filter-active'));
}

function assertCurrentPage(page: number) {
  cy.get('.tui-is-selected').should('have.text', String(page));
}

function assertLastPage(lastPage: number) {
  cy.get('.tui-last-child').should('have.text', String(lastPage));
}

function moveNextPage() {
  cy.get('.tui-page-btn.tui-next').click({ force: true });
}

before(() => {
  cy.visit('/dist');
});

describe('pagination + sort', () => {
  beforeEach(() => {
    createGridWithPagination();
  });

  it('should sort the paginated data', () => {
    cy.gridInstance().invoke('sort', 'deliveryType', false);

    assertHaveSortingBtnClass('btn-sorting-down');
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'Hanjung'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'Hanjung'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'RyuSeonIm'],
      ['Visit', 'Hanjung'],
      ['Parcel', 'ChoJungEun'],
      ['Parcel', 'YooDongSik']
    ]);
  });

  it('should sort the data after moving the next page', () => {
    cy.gridInstance().invoke('sort', 'deliveryType', false);
    moveNextPage();

    assertHaveSortingBtnClass('btn-sorting-down');
    cy.getRsideBody().should('have.cellData', [
      ['Parcel', 'KimSungHo'],
      ['Parcel', 'RyuSeonIm'],
      ['Parcel', 'ChoJungEun'],
      ['Parcel', 'ChoJungEun'],
      ['ExpressDelivery', 'ParkJungHwan'],
      ['ExpressDelivery', 'RyuSeonIm'],
      ['ExpressDelivery', 'YooDongSik'],
      ['ExpressDelivery', 'LeeJaeSung'],
      ['ExpressDelivery', 'Hanjung'],
      ['ExpressDelivery', 'ParkJungHwan']
    ]);
  });
});

describe('pagination + filter', () => {
  it('should filter the paginated data', () => {
    createGridWithPagination();
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Parcel' }]);

    assertActiveFilterBtn();
    assertCurrentPage(1);
    assertLastPage(1);
    assertColumnData('deliveryType', 'Parcel');
  });

  it('should maintain the filtered data after moving the next page', () => {
    createGridWithPagination(data.slice(0, 80));
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'contain', value: 'P' }]);
    moveNextPage();

    assertActiveFilterBtn();
    assertCurrentPage(2);
    assertColumnData('deliveryType', 'Parcel');
  });

  it('should move the first page after filtering the data with movded the page', () => {
    createGridWithPagination();
    moveNextPage();
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Parcel' }]);

    assertActiveFilterBtn();
    assertCurrentPage(1);
    assertColumnData('deliveryType', 'Parcel');
  });
});

describe('filter + sort', () => {
  beforeEach(() => {
    createGrid();
  });

  it('The sort should be operated after sorting the data with "sortKey", in case of being applied filter condition', () => {
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Visit' }]);
    cy.gridInstance().invoke('sort', 'orderName', true);
    cy.gridInstance().invoke('unsort', 'orderName');

    assertActiveFilterBtn();
    assertHaveNotSortingBtnClass('btn-sorting-up');
    assertHaveNotSortingBtnClass('btn-sorting-down');
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'Hanjung'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'Hanjung'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'RyuSeonIm'],
      ['Visit', 'Hanjung']
    ]);

    cy.gridInstance().invoke('sort', 'orderName', false);

    assertActiveFilterBtn();
    assertHaveSortingBtnClass('btn-sorting-down');
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'RyuSeonIm'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung']
    ]);
  });

  it('The filter should be operated with sort condition', () => {
    cy.gridInstance().invoke('sort', 'orderName', false);
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Visit' }]);

    assertActiveFilterBtn();
    assertHaveSortingBtnClass('btn-sorting-down');
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'RyuSeonIm'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung']
    ]);
  });
});

describe('pagination + filter + sort', () => {
  it('The functionality of filtering and sorting should be operated with pagination properly', () => {
    createGridWithPagination();
    cy.gridInstance().invoke('sort', 'orderName', true);
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Visit' }]);

    assertActiveFilterBtn();
    assertHaveSortingBtnClass('btn-sorting-up');
    assertCurrentPage(1);
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'RyuSeonIm']
    ]);
  });
});
