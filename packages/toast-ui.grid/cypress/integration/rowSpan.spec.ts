import { RowKey, RowSpan } from '@t/store/data';
import { data as sample } from '../../samples/basic';
import { OptColumn, OptGrid, OptRow } from '@t/options';
import { invokeFilter, dragAndDropRow } from '../helper/util';
import { deepCopyArray } from '@/helper/common';

function scrollTo(position: Cypress.PositionType) {
  cy.getByCls('rside-area', 'body-area').wait(100).scrollTo(position);
}

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

it('should render rowSpan cell properly after some cell edited', () => {
  cy.createGrid({ data, columns });

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.getByCls('content-text').type('Kim');
  cy.gridInstance().invoke('finishEditing', 0, 'name');

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
  const columnsForDynamicRowSpanToAll: OptColumn[] = [
    { name: 'name', rowSpan: true },
    { name: 'age', filter: 'number', sortingType: 'asc', sortable: true, rowSpan: true },
    { name: 'value', rowSpan: true },
  ];
  const columnsForDynamicRowSpanToAge: OptColumn[] = [
    { name: 'name' },
    { name: 'age', filter: 'number', sortingType: 'asc', sortable: true, rowSpan: true },
    { name: 'value' },
  ];

  function createGridWithRowSpan(
    options?: Omit<OptGrid, 'el' | 'columns'>,
    columnsOptions?: OptColumn[]
  ) {
    const rowSpanColumns = columnsOptions ?? columnsForDynamicRowSpanToAge;

    cy.createGrid({
      data: dataForDynamicRowSpan,
      columns: rowSpanColumns,
      ...options,
    });
  }

  it("should render rowSpan cell properly for all columns (rowSpan: 'all')", () => {
    createGridWithRowSpan({}, columnsForDynamicRowSpanToAll);

    cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
    cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    cy.getCell(0, 'value').should('have.attr', 'rowSpan', '4');
    cy.getCell(4, 'value').should('have.attr', 'rowSpan', '2');
  });

  it("should render rowSpan cell properly for specific columns (rowSpan: ['age'])", () => {
    createGridWithRowSpan();

    cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
    cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    cy.getColumnCells('value').each(($el) => {
      cy.wrap($el).should('not.have.attr', 'rowSpan');
    });
  });

  it('should render rowSpan cell properly when scroll', () => {
    createGridWithRowSpan({
      data: dataForDynamicRowSpan.concat(dataForDynamicRowSpan),
      bodyHeight: 200,
    });

    scrollTo('bottomLeft');

    cy.getCell(9, 'age').should('have.attr', 'rowSpan', '2');
  });

  describe('With filter', () => {
    it('should render rowSpan cell properly with filter', () => {
      createGridWithRowSpan();

      invokeFilter('age', [{ code: 'eq', value: 10 }]);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '3');
    });

    it('should render rowSpan cell properly with unfilter', () => {
      createGridWithRowSpan();

      invokeFilter('age', [{ code: 'eq', value: 10 }]);

      cy.gridInstance().invoke('unfilter', 'age');

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });
  });

  describe('With row D&D', () => {
    it('should reset rowSpan when row drag started', () => {
      createGridWithRowSpan({ draggable: true });

      cy.getCell(0, '_draggable').trigger('mousedown');

      cy.getColumnCells('age').each(($el) => {
        cy.wrap($el).should('not.have.attr', 'rowSpan');
      });
    });

    it('should render rowSpan cell properly after D&D', () => {
      createGridWithRowSpan({ draggable: true });

      dragAndDropRow(0, 250);

      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(5, 'age').should('have.attr', 'rowSpan', '2');
    });
  });

  describe('With sort', () => {
    it('should render rowSpan cell properly after sorting (asc)', () => {
      createGridWithRowSpan();

      cy.gridInstance().invoke('sort', 'age', true);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '3');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after sorting (desc)', () => {
      createGridWithRowSpan();

      cy.gridInstance().invoke('sort', 'age', false);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '3');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after unsorting', () => {
      createGridWithRowSpan();

      cy.gridInstance().invoke('sort', 'age', true);
      cy.gridInstance().invoke('unsort', 'age');

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });
  });

  describe('With pagination', () => {
    it('should render rowSpan cell properly with pagination', () => {
      createGridWithRowSpan({
        pageOptions: {
          useClient: true,
          perPage: 5,
        },
      });

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should not apply rowSpan to another page cell', () => {
      createGridWithRowSpan({
        pageOptions: {
          useClient: true,
          perPage: 4,
        },
      });

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('not.have.attr', 'rowSpan');
    });
  });

  describe('With other data modifying APIs', () => {
    it('should render rowSpan cell properly after showColumn()', () => {
      const columnsWithHideAge = deepCopyArray(columnsForDynamicRowSpanToAge);
      columnsWithHideAge[1].hidden = true;
      createGridWithRowSpan({}, columnsWithHideAge);

      cy.gridInstance().invoke('showColumn', 'age');

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after setValue()', () => {
      createGridWithRowSpan();

      cy.gridInstance().invoke('setValue', 2, 'age', 10);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '3');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after setColumnValues()', () => {
      createGridWithRowSpan();

      cy.gridInstance().invoke('setColumnValues', 'age', 10);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '6');
    });

    it('should render rowSpan cell properly after appendRow()', () => {
      createGridWithRowSpan();

      const appendedRow = { name: 'Choi', age: 10, value: 3 };

      cy.gridInstance().invoke('appendRow', appendedRow);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(5, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after prependRow()', () => {
      createGridWithRowSpan();

      const prependedRow = { name: 'Choi', age: 10, value: 3 };

      cy.gridInstance().invoke('prependRow', prependedRow);

      cy.getCell(6, 'age').should('have.attr', 'rowSpan', '3');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after removeRow()', () => {
      createGridWithRowSpan();

      cy.gridInstance().invoke('removeRow', 0);

      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after setRow()', () => {
      createGridWithRowSpan();

      const setRow = { name: 'Cho', age: 10, value: 1 };

      cy.gridInstance().invoke('setRow', 2, setRow);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '3');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after appendRows()', () => {
      createGridWithRowSpan();

      const appendedRow = [{ name: 'Choi', age: 10, value: 3 }];

      cy.gridInstance().invoke('appendRows', appendedRow);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(5, 'age').should('have.attr', 'rowSpan', '2');
    });

    it('should render rowSpan cell properly after resetData()', () => {
      createGridWithRowSpan();

      cy.gridInstance().invoke('resetData', dataForDynamicRowSpan);

      cy.getCell(0, 'age').should('have.attr', 'rowSpan', '2');
      cy.getCell(3, 'age').should('have.attr', 'rowSpan', '2');
    });
  });
});
