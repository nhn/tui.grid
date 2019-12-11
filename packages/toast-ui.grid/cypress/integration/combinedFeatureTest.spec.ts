import { data } from '../../samples/pagination';
import { cls, ClassNameType } from '@/helper/dom';
import { OptRow } from '@/types';

const PER_PAGE_COUNT = 10;

const columns = [
  { name: 'deliveryType', sortable: true, sortingType: 'desc', filter: 'text' },
  { name: 'orderName', sortable: true }
];

function createGrid(newData?: OptRow[]) {
  cy.createGrid({
    data: newData || data.slice(0, 20),
    pageOptions: {
      useClient: true,
      perPage: PER_PAGE_COUNT
    },
    columns
  });
}

function assertColumnData(column: string, text: string) {
  cy.getColumnCells('name').should('sameColumnData', text);
}

function assertSortingBtnClass(className: ClassNameType) {
  cy.getByCls('btn-sorting').should('have.class', cls(className));
}

function assertActiveFilterBtn() {
  cy.getByCls('btn-filter').should('have.class', cls('btn-filter-active'));
}

function moveNextPage() {
  cy.get('.tui-page-btn.tui-next').click({ force: true });
}

before(() => {
  cy.visit('/dist');
});

describe('pagination + sort', () => {
  beforeEach(() => {
    createGrid();
  });

  it('should sort the paginated data', () => {
    cy.gridInstance().invoke('sort', 'deliveryType', false);

    assertSortingBtnClass('btn-sorting-down');
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

    assertSortingBtnClass('btn-sorting-down');
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
    createGrid();
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Parcel' }]);

    assertActiveFilterBtn();
    assertColumnData('deliveryType', 'Parcel');
  });

  it('should filter the paginated data after moving the next page', () => {
    createGrid(data.slice(0, 80));
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'contain', value: 'P' }]);
    moveNextPage();

    assertActiveFilterBtn();
    assertColumnData('deliveryType', 'Parcel');
  });

  it('should filter the paginated data with movded the page', () => {
    createGrid();
    moveNextPage();
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Parcel' }]);

    assertActiveFilterBtn();
    assertColumnData('deliveryType', 'Parcel');
  });
});

describe('pagination + filter + sort', () => {
  it('The functionality of filtering and sorting should be operated with pagination properly', () => {
    createGrid();
    cy.gridInstance().invoke('sort', 'orderName', true);
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Visit' }]);

    assertActiveFilterBtn();
    assertSortingBtnClass('btn-sorting-up');
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
