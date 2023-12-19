import { OptRow } from '@t/options';
import { Row } from '@t/store/data';
import { data } from '../../samples/pagination';
import { twoDepthData, threeDepthData } from '../../samples/relations';
import { cls, ClassNameType } from '@/helper/dom';
import { compare } from '@/helper/sort';
import { isBoolean } from '@/helper/common';
import { moveToNextPage } from '../helper/util';
import { assertLastPage, assertCurrentPage } from '../helper/assert';

const PER_PAGE_COUNT = 10;
const SCROLL_PER_PAGE_COUNT = 50;

const columns = [
  { name: 'deliveryType', sortable: true, sortingType: 'desc', filter: 'text', editor: 'text' },
  { name: 'orderName', sortable: true },
];

function createGridWithPagination(newData?: OptRow[]) {
  cy.createGrid({
    data: newData || data.slice(0, 20),
    pageOptions: {
      useClient: true,
      perPage: PER_PAGE_COUNT,
    },
    columns,
  });
}

function createGridWithScrollType(newData?: OptRow[]) {
  cy.createGrid({
    data: newData || data.slice(0, 200),
    bodyHeight: 300,
    pageOptions: {
      useClient: true,
      perPage: SCROLL_PER_PAGE_COUNT,
      type: 'scroll',
    },
    rowHeaders: ['rowNum'],
    columns,
  });
}

function createGridWithRelationColumns() {
  const relationData = [
    {
      category1: '02',
      category2: '02_03',
      category3: '02_03_0001',
      category4: '01',
    },
    {
      category1: '03',
      category2: '03_01',
      category3: '03_01_0001',
      category4: '02',
    },
  ];
  const relationColumns = [
    {
      header: 'Category1',
      name: 'category1',
      formatter: 'listItemText',
      editor: {
        type: 'select',
        options: {
          listItems: [
            { text: '', value: '' },
            { text: 'Domestic', value: '01' },
            { text: 'Overseas', value: '02' },
            { text: 'Etc', value: '03' },
          ],
        },
      },
      relations: [
        {
          targetNames: ['category2'],
          listItems({ value }: { value: string }) {
            return twoDepthData[value];
          },
        },
      ],
    },
    {
      header: 'Category2',
      name: 'category2',
      formatter: 'listItemText',
      editor: 'select',
      filter: 'text',
      relations: [
        {
          targetNames: ['category3'],
          listItems({ value }: { value: string }) {
            return threeDepthData[value];
          },
        },
      ],
    },
    {
      header: 'Category3',
      name: 'category3',
      formatter: 'listItemText',
      editor: 'select',
    },
  ];
  cy.createGrid({ data: relationData, columns: relationColumns });
}

function createGrid() {
  cy.createGrid({
    data: data.slice(0, 20),
    columns,
  });
}

function assertColumnData(column: string, text: string) {
  cy.getColumnCells(column).should('have.sameColumnData', text);
}

function assertHaveSortingBtnClass(columnName: string, className: ClassNameType) {
  cy.get(`th[data-column-name=${columnName}] .${cls('btn-sorting')}`).should(
    'have.class',
    cls(className)
  );
}

function assertHaveNotSortingBtnClass(columnName: string, className: ClassNameType) {
  cy.get(`th[data-column-name=${columnName}] .${cls('btn-sorting')}`).should(
    'have.not.class',
    cls(className)
  );
}

function assertSortedData(page: number, columnName: string, ascending?: boolean) {
  cy.gridInstance()
    .invoke('getData')
    .should((rows: OptRow[]) => {
      const length = SCROLL_PER_PAGE_COUNT * page;
      const actualValues = rows.slice(0, length).map((row) => row[columnName]) as string[];
      const expectValues = ([...data] as OptRow[])
        .slice(0, length)
        .map((row) => row[columnName]) as string[];

      if (isBoolean(ascending)) {
        if (ascending) {
          expectValues.sort((a, b) => compare(a, b));
        } else {
          expectValues.sort((a, b) => -compare(a, b));
        }
      }

      expect(actualValues).eql(expectValues);
    });
}

function assertActiveFilterBtn() {
  cy.getByCls('btn-filter').should('have.class', cls('btn-filter-active'));
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

    assertHaveSortingBtnClass('deliveryType', 'btn-sorting-down');
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
      ['Parcel', 'YooDongSik'],
    ]);
  });

  it('should sort the data after moving the next page', () => {
    cy.gridInstance().invoke('sort', 'deliveryType', false);
    moveToNextPage();

    assertHaveSortingBtnClass('deliveryType', 'btn-sorting-down');
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
      ['ExpressDelivery', 'ParkJungHwan'],
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
    moveToNextPage();

    assertActiveFilterBtn();
    assertCurrentPage(2);
    assertColumnData('deliveryType', 'Parcel');
  });

  it('should move the first page after filtering the data with movded the page', () => {
    createGridWithPagination();

    moveToNextPage();
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Parcel' }]);

    assertActiveFilterBtn();
    assertCurrentPage(1);
    assertColumnData('deliveryType', 'Parcel');
  });

  it('should move the first page after unfiltering the data with movded the page', () => {
    createGridWithPagination(data.slice(0, 80));

    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'contain', value: 'P' }]);
    moveToNextPage();
    cy.gridInstance().invoke('unfilter', 'deliveryType');

    assertCurrentPage(1);
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
    assertHaveNotSortingBtnClass('deliveryType', 'btn-sorting-up');
    assertHaveNotSortingBtnClass('deliveryType', 'btn-sorting-down');
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'Hanjung'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'Hanjung'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'RyuSeonIm'],
      ['Visit', 'Hanjung'],
    ]);

    cy.gridInstance().invoke('sort', 'orderName', false);

    assertActiveFilterBtn();
    assertHaveSortingBtnClass('orderName', 'btn-sorting-down');
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'RyuSeonIm'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
    ]);
  });

  it('The filter should be operated with sort condition', () => {
    cy.gridInstance().invoke('sort', 'orderName', false);
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Visit' }]);

    assertActiveFilterBtn();
    assertHaveSortingBtnClass('orderName', 'btn-sorting-down');
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'RyuSeonIm'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
    ]);
  });
});

describe('pagination + filter + sort', () => {
  it('The functionality of filtering and sorting should be operated with pagination properly', () => {
    createGridWithPagination();

    cy.gridInstance().invoke('sort', 'orderName', true);
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Visit' }]);

    assertActiveFilterBtn();
    assertHaveSortingBtnClass('orderName', 'btn-sorting-up');
    assertCurrentPage(1);
    cy.getRsideBody().should('have.cellData', [
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'Hanjung'],
      ['Visit', 'KimDongWoo'],
      ['Visit', 'KimSungHo'],
      ['Visit', 'RyuJinKyung'],
      ['Visit', 'RyuSeonIm'],
    ]);
  });
});

describe('formatter + filter + relation', () => {
  beforeEach(() => {
    createGridWithRelationColumns();
  });

  it('relation column data should be filtered with "listItemText" formatter', () => {
    cy.gridInstance().invoke('filter', 'category2', [{ code: 'eq', value: 'OST' }]);

    assertActiveFilterBtn();
    cy.getRsideBody().should('have.cellData', [['Etc', 'OST', 'City Of Stars']]);
  });

  it('should apply changed relation data on filtering the data', () => {
    cy.gridInstance().invoke('setValue', 0, 'category1', '02');
    cy.gridInstance().invoke('setValue', 0, 'category2', '02_01');
    cy.gridInstance().invoke('filter', 'category2', [{ code: 'eq', value: 'Pop' }]);

    assertActiveFilterBtn();
    cy.getRsideBody().should('have.cellData', [['Overseas', 'Pop', '']]);
  });

  it('relation column data should be filtered after changing the cell data', () => {
    cy.gridInstance().invoke('filter', 'category2', [{ code: 'eq', value: 'R&B' }]);
    cy.gridInstance().invoke('setValue', 0, 'category1', '02');
    cy.gridInstance().invoke('setValue', 0, 'category2', '02_01');

    assertActiveFilterBtn();
    cy.getRsideBody().should('have.cellData', []);

    cy.gridInstance().invoke('setValue', 0, 'category1', '02');
    cy.gridInstance().invoke('setValue', 0, 'category2', '02_03');

    assertActiveFilterBtn();
    cy.getRsideBody().should('have.cellData', [['Overseas', 'R&B', 'Marry You']]);
  });
});

describe('pagination(infinite scroll) + sort', () => {
  beforeEach(() => {
    createGridWithScrollType();
  });

  it('should sort the data after adding next data', () => {
    cy.gridInstance().invoke('sort', 'deliveryType', false);

    assertHaveSortingBtnClass('deliveryType', 'btn-sorting-down');
    assertSortedData(1, 'deliveryType', false);

    // scroll at the bottommost
    cy.focusAndWait(45, 'deliveryType');

    assertHaveSortingBtnClass('deliveryType', 'btn-sorting-down');
    assertSortedData(2, 'deliveryType', false);
  });

  it('should change the row number after sorting', () => {
    cy.gridInstance().invoke('sort', 'deliveryType', false);

    // scroll at the bottommost
    cy.focusAndWait(46, 'orderName');

    cy.gridInstance()
      .invoke('getData')
      .should((rows: Row[]) => {
        const actualValues = rows.map((row) => row._attributes.rowNum);
        const expectValues = rows.map((_, index) => index + 1);
        expect(actualValues).eql(expectValues);
      });
  });

  it('should unsort the data properly', () => {
    cy.gridInstance().invoke('sort', 'deliveryType', false);

    // scroll at the bottommost
    cy.focusAndWait(49, 'orderName');

    cy.gridInstance().invoke('unsort', 'deliveryType');

    assertHaveNotSortingBtnClass('deliveryType', 'btn-sorting-up');
    assertHaveNotSortingBtnClass('deliveryType', 'btn-sorting-down');
    assertSortedData(2, 'deliveryType');
  });
});

describe('pagination(infinite scroll) + filter', () => {
  beforeEach(() => {
    createGridWithScrollType();
  });

  it('should filter the paginated data properly', () => {
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Parcel' }]);

    assertActiveFilterBtn();
    assertColumnData('deliveryType', 'Parcel');

    // scroll at the bottommost
    cy.focusAndWait(46, 'orderName');

    assertActiveFilterBtn();
    assertColumnData('deliveryType', 'Parcel');
  });

  it('should maintain the row number after filtering', () => {
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Parcel' }]);

    // scroll at the bottommost
    cy.focusAndWait(46, 'orderName');

    cy.gridInstance()
      .invoke('getData')
      .should((rows: Row[]) => {
        const actualValues = rows.map((row) => row._attributes.rowNum);
        const expectValues = rows.map((_, index) => index + 1);
        expect(actualValues).eql(expectValues);
      });
  });
});

describe('pagination(infinite scroll) + filter + sort', () => {
  it('The functionality of filtering and sorting should be operated with pagination properly', () => {
    createGridWithScrollType();

    cy.gridInstance().invoke('sort', 'orderName', true);
    cy.gridInstance().invoke('filter', 'deliveryType', [{ code: 'eq', value: 'Visit' }]);

    assertActiveFilterBtn();
    assertHaveSortingBtnClass('orderName', 'btn-sorting-up');
    assertSortedData(1, 'orderName', true);
    assertColumnData('deliveryType', 'Visit');

    // scroll at the bottommost
    cy.focusAndWait(49, 'deliveryType');

    assertSortedData(2, 'orderName', true);
    assertColumnData('deliveryType', 'Visit');
  });
});

describe('editor + sort', () => {
  beforeEach(() => {
    createGrid();
  });

  it('can editing cell after sort', () => {
    cy.gridInstance().invoke('sort', 'orderName', true);

    cy.getCellByIdx(0, 0).should('not.have.text', 'Visit');

    cy.gridInstance().invoke('startEditingAt', 0, 0);
    cy.getByCls('content-text').type('Visit');
    cy.gridInstance().invoke('finishEditing');

    cy.getCellByIdx(0, 0).should('have.text', 'Visit');
  });
});
