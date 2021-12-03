import { RowKey, RowSpan } from '@t/store/data';
import { data as sample } from '../../samples/basic';
import { OptRow } from '@t/options';
import { invokeFilter } from '../helper/util';

function createDataWithRowSpanAttr(): OptRow[] {
  const optRows: OptRow[] = sample.slice();
  optRows[0]._attributes = {
    rowSpan: {
      name: 2,
      artist: 3,
    },
  };

  optRows[3]._attributes = {
    rowSpan: {
      name: 3,
    },
  };

  optRows[4]._attributes = {
    rowSpan: {
      artist: 3,
    },
  };

  optRows[10]._attributes = {
    rowSpan: {
      type: 2,
    },
  };

  return optRows;
}

function assertRowSpanData(rowKey: RowKey, columnName: string, rowSpan: RowSpan) {
  cy.gridInstance()
    .invoke('getRowSpanData', rowKey, columnName)
    .should((rowSpanData) => {
      expect(rowSpanData).to.contain(rowSpan);
    });
}

before(() => {
  cy.visit('/dist');
});

const data = createDataWithRowSpanAttr();
const columns = [
  { name: 'name', editor: 'text', sortable: true },
  { name: 'artist', editor: 'text' },
  { name: 'type', editor: 'text' },
];

it('render rowSpan cell properly', () => {
  cy.createGrid({ data, columns });
  cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
  cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');
  cy.getCell(3, 'name').should('have.attr', 'rowSpan', '3');
  cy.getCell(4, 'artist').should('have.attr', 'rowSpan', '3');
});

describe('getRowSpanData()', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it('getRowSpanData(0, name)', () => {
    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 2, spanCount: 2 });
  });

  it('getRowSpanData(4, name)', () => {
    assertRowSpanData(4, 'name', { mainRow: false, mainRowKey: 3, count: -1, spanCount: 3 });
  });
});

describe('appendRow()', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it('appendRow at 1 with extendPrevRowSpan options: true', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 1, extendPrevRowSpan: true }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '3');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 3, spanCount: 3 });
    assertRowSpanData(20, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 3 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 3 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 1 with extendPrevRowSpan options: false', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 1, extendPrevRowSpan: false }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '3');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 3, spanCount: 3 });
    assertRowSpanData(20, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 3 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 3 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 2 with extendPrevRowSpan options: true', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 2, extendPrevRowSpan: true }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '3');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 3, spanCount: 3 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 3 });
    assertRowSpanData(20, 'name', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 3 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 2 with extendPrevRowSpan options: false', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 2, extendPrevRowSpan: false }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 2, spanCount: 2 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 2 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 3 with extendPrevRowSpan options: true', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 3, extendPrevRowSpan: true }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '4');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 2, spanCount: 2 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 2 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 4, spanCount: 4 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 4 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 4 });
    assertRowSpanData(20, 'artist', { mainRow: false, mainRowKey: 0, count: -3, spanCount: 4 });
  });

  it('appendRow at 3 with extendPrevRowSpan options: false', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'JS test', artist: 'JS', type: 'TEST' },
      { at: 3, extendPrevRowSpan: false }
    );

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');

    assertRowSpanData(0, 'name', { mainRow: true, mainRowKey: 0, count: 2, spanCount: 2 });
    assertRowSpanData(1, 'name', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 2 });

    assertRowSpanData(0, 'artist', { mainRow: true, mainRowKey: 0, count: 3, spanCount: 3 });
    assertRowSpanData(1, 'artist', { mainRow: false, mainRowKey: 0, count: -1, spanCount: 3 });
    assertRowSpanData(2, 'artist', { mainRow: false, mainRowKey: 0, count: -2, spanCount: 3 });
  });
});

describe('removeRow()', () => {
  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it('removeRow at 0', () => {
    cy.gridInstance().invoke('removeRow', 0, {
      keepRowSpanData: true,
    });

    cy.getCell(1, 'artist').should('have.attr', 'rowSpan', '2');

    assertRowSpanData(1, 'artist', {
      mainRow: true,
      mainRowKey: 1,
      count: 2,
      spanCount: 2,
    });
    assertRowSpanData(2, 'artist', {
      mainRow: false,
      mainRowKey: 1,
      count: -1,
      spanCount: 2,
    });
  });

  it('removeRow at 1', () => {
    cy.gridInstance().invoke('removeRow', 1, {
      keepRowSpanData: true,
    });

    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '2');

    assertRowSpanData(0, 'artist', {
      mainRow: true,
      mainRowKey: 0,
      count: 2,
      spanCount: 2,
    });
    assertRowSpanData(2, 'artist', {
      mainRow: false,
      mainRowKey: 0,
      count: -1,
      spanCount: 2,
    });
  });

  it('removeRow at 2', () => {
    cy.gridInstance().invoke('removeRow', 2, {
      keepRowSpanData: true,
    });

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '2');

    assertRowSpanData(0, 'name', {
      mainRow: true,
      mainRowKey: 0,
      count: 2,
      spanCount: 2,
    });
    assertRowSpanData(1, 'name', {
      mainRow: false,
      mainRowKey: 0,
      count: -1,
      spanCount: 2,
    });

    assertRowSpanData(0, 'artist', {
      mainRow: true,
      mainRowKey: 0,
      count: 2,
      spanCount: 2,
    });
    assertRowSpanData(1, 'artist', {
      mainRow: false,
      mainRowKey: 0,
      count: -1,
      spanCount: 2,
    });
  });

  it('removeRow at 3', () => {
    cy.gridInstance().invoke('removeRow', 3, {
      keepRowSpanData: true,
    });

    cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');
    cy.getCell(4, 'name').should('have.attr', 'rowSpan', '2');

    assertRowSpanData(4, 'name', {
      mainRow: true,
      mainRowKey: 4,
      count: 2,
      spanCount: 2,
    });
    assertRowSpanData(5, 'name', {
      mainRow: false,
      mainRowKey: 4,
      count: -1,
      spanCount: 2,
    });
  });
});

it('render rowSpan cell properly by calling resetData API', () => {
  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('resetData', createDataWithRowSpanAttr());

  cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
  cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');
  cy.getCell(3, 'name').should('have.attr', 'rowSpan', '3');
  cy.getCell(4, 'artist').should('have.attr', 'rowSpan', '3');
});

it('render rowSpan cell properly by calling setColumns API', () => {
  cy.createGrid({ data: createDataWithRowSpanAttr(), columns: columns.slice(0, 1) });
  cy.gridInstance().invoke('setColumns', columns);

  cy.getCell(0, 'name').should('have.attr', 'rowSpan', '2');
  cy.getCell(0, 'artist').should('have.attr', 'rowSpan', '3');
  cy.getCell(3, 'name').should('have.attr', 'rowSpan', '3');
  cy.getCell(4, 'artist').should('have.attr', 'rowSpan', '3');
});

describe('Dynamic RowSpan', () => {
  const dataForDynamicRowSpan = [
    { name: 'Han', age: 10, value: 1 },
    { name: 'Kim', age: 10, value: 1 },
    { name: 'Cho', age: 20, value: 1 },
    { name: 'Ryu', age: 15, value: 1 },
    { name: 'Lee', age: 15, value: 2 },
    { name: 'Park', age: 10, value: 2 },
  ];
  const columnsForDynamicRowSpan = [
    { name: 'name' },
    { name: 'age', filter: 'number' },
    { name: 'value' },
  ];

  it("should render rowSpan cell properly for all columns (rowSpan: 'all')", () => {
    cy.createGrid({
      data: dataForDynamicRowSpan,
      columns: columnsForDynamicRowSpan,
      rowSpan: 'all',
    });

    cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
    cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'value').should('have.attr', 'rowSpan', '4');
    cy.getCell(4, 'value').should('have.attr', 'rowSpan', '2');
  });

  it("should render rowSpan cell properly for specific columns (rowSpan: ['age'])", () => {
    cy.createGrid({
      data: dataForDynamicRowSpan,
      columns: columnsForDynamicRowSpan,
      rowSpan: ['age'],
    });

    cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
    cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'value').should('not.have.attr', 'rowSpan', '4');
    cy.getCell(4, 'value').should('not.have.attr', 'rowSpan', '2');
  });

  describe('With filter', () => {
    it('should render rowSpan cell properly with filter', () => {
      cy.createGrid({
        data: dataForDynamicRowSpan,
        columns: columnsForDynamicRowSpan,
        rowSpan: 'all',
      });

      invokeFilter('age', [{ code: 'eq', value: 10 }]);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '3');
      cy.getCell(0, 'value').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly with unfilter', () => {
      cy.createGrid({
        data: dataForDynamicRowSpan,
        columns: columnsForDynamicRowSpan,
        rowSpan: 'all',
      });

      invokeFilter('age', [{ code: 'eq', value: 10 }]);

      cy.gridInstance().invoke('unfilter', 'age');

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(0, 'value').should('have.attr', 'rowSpan', '4');
      cy.getCell(4, 'value').should('have.attr', 'rowSpan', '2');
    });
  });
});
