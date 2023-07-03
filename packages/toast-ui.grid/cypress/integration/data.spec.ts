import { OptGrid } from '@t/options';
import { Row, RowKey } from '@t/store/data';
import { cls } from '@/helper/dom';
import { FormatterProps } from '@t/store/column';
import { applyAliasHeaderCheckbox, dragAndDropRow, invokeFilter } from '../helper/util';
import { assertGridHasRightRowNumber, assertHeaderCheckboxStatus } from '../helper/assert';

function assertHeaderCheckboxDisabled(disable: boolean) {
  applyAliasHeaderCheckbox();

  if (disable) {
    cy.get('@checkbox').should('be.disabled');
  } else {
    cy.get('@checkbox').should('not.be.disabled');
  }
}

function assertCheckboxDisabledAfterClick(status: boolean[]) {
  applyAliasHeaderCheckbox();
  cy.get('@checkbox').click();

  cy.getByCls('cell-row-header')
    .get('input')
    .each(($el, idx) => {
      if (status[idx]) {
        cy.wrap($el).should('not.be.disabled');
      } else {
        cy.wrap($el).should('be.disabled');
      }
    });
}

function assertCheckboxStatus(checked: boolean) {
  cy.get('input').should(($el) => {
    $el.each((_, elem) => {
      expect(elem.checked).eq(checked);
    });
  });
}

function createGrid(options: Omit<OptGrid, 'el' | 'columns'> = {}) {
  const data = [
    { name: 'Kim', age: 10 },
    { name: 'Lee', age: 20 },
  ];
  const columns = [
    { name: 'name', editor: 'text', sortable: true, filter: 'text' },
    { name: 'age', editor: 'text', sortable: true },
  ];

  cy.createGrid({ data, columns, scrollY: true, bodyHeight: 400, ...options });
}

function createGridWithLargeData(options: Omit<OptGrid, 'el' | 'columns' | 'data'> = {}) {
  const largeData = [
    { name: 'Kim', age: 10 },
    { name: 'Lee', age: 20 },
    { name: 'Ryu', age: 30 },
    { name: 'Han', age: 40 },
  ];
  const columns = [
    { name: 'name', editor: 'text', sortable: true, filter: 'text' },
    { name: 'age', editor: 'text', sortable: true },
  ];

  cy.createGrid({ data: largeData, columns, scrollY: true, bodyHeight: 400, ...options });
}

before(() => {
  cy.visit('/dist');
});

describe('appendRow()', () => {
  it('append a row at the end of the data', () => {
    createGrid();
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });

    cy.getCellByIdx(2, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(2, 1).should('to.have.text', '30');
  });

  it('if at option exist, insert a row at the given index', () => {
    createGrid();
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 }, { at: 1 });

    cy.getCellByIdx(2, 0).should('have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('have.text', '20');
    cy.getCellByIdx(1, 0).should('have.text', 'Park');
    cy.getCellByIdx(1, 1).should('have.text', '30');
  });

  it('if focus option exist, set focus to the first cell of the inserted row', () => {
    createGrid();
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 }, { focus: true });

    cy.gridInstance().invoke('getFocusedCell').should('eql', {
      rowKey: 2,
      columnName: 'name',
      value: 'Park',
    });
  });

  it('if first argument is undefined, insert empty object', () => {
    createGrid();
    cy.gridInstance().invoke('appendRow');

    cy.getCellByIdx(2, 0).should('to.have.text', '');
    cy.getCellByIdx(2, 1).should('to.have.text', '');
  });

  it('rowKey is created properly as max index', () => {
    createGrid();
    cy.gridInstance().invoke('removeRow', 0);
    cy.gridInstance().invoke('appendRow', { name: 'Kim', age: 40 });

    cy.gridInstance().invoke('getRowAt', 1).its('rowKey').should('eq', 2);
  });

  it('rowKey is created properly as max index on empty grid', () => {
    createGrid();
    cy.gridInstance().invoke('resetData', []);
    cy.gridInstance().invoke('appendRow', { name: 'Kim', age: 40 });

    cy.gridInstance().invoke('getRowAt', 0).its('rowKey').should('eq', 0);
  });

  it('should insert empty value for each column as append the empty row', () => {
    createGrid();
    cy.gridInstance().invoke('appendRow', {});

    cy.gridInstance()
      .invoke('getModifiedRows')
      .its('createdRows.0')
      .should('have.subset', { name: null, age: null });
  });

  it('should update row number after calling appendRow()', () => {
    createGridWithLargeData({ rowHeaders: ['rowNum'] });

    cy.gridInstance().invoke('appendRow', { name: 'Yoo', age: 50 }, { at: 2 });

    assertGridHasRightRowNumber();
  });

  it('should maintain the sort state after calling appendRow()', () => {
    createGridWithLargeData();

    cy.gridInstance().invoke('sort', 'name', true);
    cy.gridInstance().invoke('appendRow', { name: 'Yoo', age: 50 });

    cy.gridInstance()
      .invoke('getSortState')
      .should('have.subset', { columns: [{ columnName: 'name', ascending: true }] });
  });

  it('header checkbox state changes after calling appendRow()', () => {
    createGrid({ rowHeaders: ['checkbox'], disabled: true });

    assertHeaderCheckboxDisabled(true);

    cy.gridInstance().invoke('appendRow', { name: 'han', age: 29 });

    assertHeaderCheckboxDisabled(false);

    assertCheckboxDisabledAfterClick([true, false, false, true]);
  });

  it('should check the header checkbox of added data after calling appendRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('appendRow', { name: 'han', age: 29, _attributes: { checked: true } });

    assertCheckboxStatus(true);
  });

  it('should not check the header checkbox of non checked added data after calling appendRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('appendRow', { name: 'han', age: 29 });

    assertHeaderCheckboxStatus(false);
  });

  it('should make appended empty row overservable', () => {
    createGrid();

    cy.gridInstance().invoke('appendRow');
    cy.gridInstance().invoke('setValue', 2, 'name', 'observable');

    cy.getCell(2, 'name').should('have.text', 'observable');
  });
});

describe('prependRow()', () => {
  it('insert a row at the start of the data', () => {
    createGrid();
    cy.gridInstance().invoke('prependRow', { name: 'Park', age: 30 });

    cy.getCellByIdx(2, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('to.have.text', '20');
    cy.getCellByIdx(0, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(0, 1).should('to.have.text', '30');
    cy.getCellByIdx(1, 0).should('to.have.text', 'Kim');
    cy.getCellByIdx(1, 1).should('to.have.text', '10');
  });

  it('if focus option exist, set focus to the first cell of the inserted row', () => {
    createGrid();
    cy.gridInstance().invoke('prependRow', { name: 'Park', age: 30 }, { focus: true });

    cy.gridInstance().invoke('getFocusedCell').should('eql', {
      rowKey: 2,
      columnName: 'name',
      value: 'Park',
    });
  });

  it('if first argument is undefined, insert empty object', () => {
    createGrid();
    cy.gridInstance().invoke('prependRow');

    cy.getCellByIdx(0, 0).should('to.have.text', '');
    cy.getCellByIdx(0, 1).should('to.have.text', '');
  });

  it('should update row number when calling prependRow()', () => {
    createGridWithLargeData({ rowHeaders: ['rowNum'] });

    cy.gridInstance().invoke('prependRow', { name: 'Yoo', age: 50 });

    assertGridHasRightRowNumber();
  });

  it('should check the header checkbox of added data after calling prependRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('prependRow', {
      name: 'han',
      age: 29,
      _attributes: { checked: true },
    });

    assertCheckboxStatus(true);
  });

  it('should not check the header checkbox of non checked added data after calling prependRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('prependRow', { name: 'han', age: 29 });

    assertHeaderCheckboxStatus(false);
  });
});

describe('removeRow()', () => {
  function scrollToBottom(rowKey: RowKey) {
    cy.focusAndWait(rowKey, 'name');
  }

  it('remove a row matching given rowKey', () => {
    createGrid();
    cy.gridInstance().invoke('removeRow', 0);

    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
  });

  it('remove a row when focus layer is active', () => {
    createGrid();
    cy.gridInstance().invoke('focus', 1, 'name', true);
    cy.gridInstance().invoke('removeRow', 0);

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { rowKey: 1, columnName: 'name', value: 'Lee' });
    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
  });

  it('remove a row when editing layer is active', () => {
    createGrid();
    cy.gridInstance().invoke('startEditing', 1, 'name', true);
    cy.gridInstance().invoke('removeRow', 0);

    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
    cy.getByCls('layer-editing').should('be.visible');
  });

  it('remove a row included focus cell', () => {
    createGrid();
    cy.gridInstance().invoke('focus', 0, 'name', true);
    cy.gridInstance().invoke('removeRow', 0);

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { rowKey: null, columnName: null, value: null });
  });

  it('should reduce the height after removing the row', () => {
    createGrid({ bodyHeight: 50, minBodyHeight: 50 });

    cy.getByCls('body-container')
      .invoke('height')
      .then((prevHeight) => {
        cy.gridInstance().invoke('removeRow', 1);
        cy.getByCls('body-area').invoke('height').should('be.lt', prevHeight);
      });
  });

  it('should update row number when calling removeRow()', () => {
    createGridWithLargeData({ rowHeaders: ['rowNum'] });

    cy.gridInstance().invoke('removeRow', 2);

    assertGridHasRightRowNumber();
  });

  it('header checkbox `disabled` state changes after calling removeRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });
    cy.gridInstance().invoke('disableRowCheck', 0);

    assertHeaderCheckboxDisabled(false);

    cy.gridInstance().invoke('removeRow', 1);

    assertHeaderCheckboxDisabled(true);
  });

  it('header checkbox `checked` state changes after calling removeRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('check', 0);

    assertHeaderCheckboxStatus(false);

    cy.gridInstance().invoke('removeRow', 1);

    assertCheckboxStatus(true);
  });

  it('should render the rows after removing selection data at the bottom position', () => {
    const data = [
      { name: 'Kim', age: 10 },
      { name: 'Lee', age: 20 },
      { name: 'Ryu', age: 30 },
      { name: 'Han', age: 40 },
      { name: 'Kwag', age: 40 },
      { name: 'Choi', age: 40 },
      { name: 'Lee', age: 40 },
      { name: 'Kim', age: 60 },
      { name: 'Park', age: 40 },
      { name: 'Lee', age: 20 },
      { name: 'Ryu', age: 30 },
      { name: 'Han', age: 40 },
      { name: 'Kwag', age: 20 },
      { name: 'Choi', age: 10 },
      { name: 'Lee', age: 30 },
      { name: 'Kim', age: 40 },
    ];
    createGrid({ data });

    scrollToBottom(14);

    cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [11, 0] });
    cy.gridInstance()
      .invoke('getSelectionRange')
      .then((range) => {
        const [selectionStart] = range.start;
        const [selectionEnd] = range.end;

        for (let i = selectionStart; i <= selectionEnd; i += 1) {
          cy.gridInstance().invoke('removeRow', i);
        }
      });

    cy.getRsideBody().should('have.cellData', [
      ['Kwag', '20'],
      ['Choi', '10'],
      ['Lee', '30'],
      ['Kim', '40'],
    ]);
  });
});

describe('removeRows', () => {
  it('should remove rows matching given row keys', () => {
    createGrid();

    cy.gridInstance().invoke('removeRows', [0, 1]);

    cy.getCellByIdx(0, 0).should('not.exist');
  });

  it('should add removed rows to modified data', () => {
    createGrid();

    cy.gridInstance().invoke('removeRows', [0, 1]);

    cy.gridInstance().invoke('getModifiedRows').its('deletedRows').should('have.length', 2);
  });
});

describe('removeCheckedRows()', () => {
  beforeEach(() => {
    // @ts-ignore
    createGrid({ rowHeaders: ['checkbox'] });
  });

  it('remove checked rows.', () => {
    cy.gridInstance().invoke('check', 1);
    cy.gridInstance().invoke('removeCheckedRows');

    cy.getCell(0, 'name').should('exist');
    cy.getCell(1, 'name').should('not.exist');
  });

  it('use confirm message.', () => {
    const stub = cy.stub();
    cy.on('window:confirm', stub);
    cy.gridInstance().invoke('check', 1);

    cy.gridInstance().invoke('removeCheckedRows', true);

    cy.wrap(stub).should('be.calledWithMatch', 'Are you sure you want to delete 1 data?');
  });

  it('use confirm cancel.', () => {
    cy.on('window:confirm', () => false);
    cy.gridInstance().invoke('check', 1);

    cy.gridInstance().invoke('removeCheckedRows', true);

    cy.getCell(1, 'name').should('exist');
  });

  it('header checkbox should be released after removing checked rows regardless of disabled row', () => {
    cy.gridInstance().invoke('disableRowCheck', 0);
    cy.gridInstance().invoke('checkAll');

    cy.gridInstance().invoke('removeCheckedRows');

    cy.getCell(0, 'name').should('exist');
    cy.getCell(1, 'name').should('not.exist');

    cy.getRowHeaderCell(0, '_checked').find('input').should('not.be.checked');
    cy.getHeaderCell('_checked').find('input').should('not.be.checked');
  });
});

describe('clear()', () => {
  it('remove all rows', () => {
    createGrid();
    cy.gridInstance().invoke('clear');

    cy.getBodyCells().should('not.exist');
  });

  it('focus, editing cell is removed when clears all data', () => {
    createGrid();
    cy.gridInstance().invoke('startEditingAt', 0, 1);
    cy.gridInstance().invoke('clear');

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { rowKey: null, columnName: null, value: null });
    cy.getByCls('layer-editing').should('not.be.visible');
  });
});

describe('resetData()', () => {
  beforeEach(() => {
    createGrid();
  });

  it('focus, editing cell is removed when resets all data', () => {
    cy.gridInstance().invoke('resetData', [
      { name: 'Park', age: 30 },
      { name: 'Han', age: 40 },
    ]);

    cy.gridInstance().invoke('getFocusedCell').should('eql', {
      rowKey: null,
      columnName: null,
      value: null,
    });
    cy.getByCls('layer-editing').should('not.be.visible');
  });

  it('sync the position of scroll when resets all data', () => {
    cy.gridInstance().invoke(
      'resetData',
      Array.from({ length: 20 }).map((_, index) => ({ name: `Park${index}`, age: 30 }))
    );

    cy.getRsideBody().scrollTo(0, 800);

    cy.gridInstance().invoke('resetData', [
      { name: 'Park', age: 30 },
      { name: 'Han', age: 40 },
    ]);

    cy.get(`.${cls('rside-area')} .${cls('body-container')}`).should(($container) => {
      expect($container.height()).to.lessThan(800);
    });
  });
});

describe('getters', () => {
  beforeEach(() => {
    createGrid();
  });

  function getRowDataWithAttrs(rowNum: number) {
    const data = [
      { name: 'Kim', age: 10 },
      { name: 'Lee', age: 20 },
    ];

    return {
      ...data[rowNum - 1],
      _attributes: {
        checkDisabled: false,
        checked: false,
        disabled: false,
        className: {
          row: [],
          column: {},
        },
        rowNum,
        // eslint-disable-next-line no-undefined
        rowSpan: undefined,
      },
    };
  }

  context('getRow()', () => {
    it('should return row matching given rowKey', () => {
      cy.gridInstance().invoke('getRow', 0).should('have.subset', getRowDataWithAttrs(1));
    });

    it('should return row matching given rowKey regardless of filtering the data', () => {
      cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'Lee' }]);

      cy.gridInstance().invoke('getRow', 0).should('have.subset', getRowDataWithAttrs(1));
    });

    it('should return row matching given rowKey after appedngind the row and clearing modified data', () => {
      const row = {
        name: 'Ryu',
        age: 10,
        _attributes: {
          checkDisabled: false,
          checked: false,
          disabled: false,
          className: {
            row: [],
            column: {},
          },
          rowNum: 2,
        },
      };

      cy.gridInstance().invoke('appendRow', { name: 'Ryu', age: 10 }, { at: 1 });
      cy.gridInstance().invoke('clearModifiedData');

      cy.gridInstance().invoke('getRow', 2).should('have.subset', row);
    });
  });

  context('getRowAt()', () => {
    it('should return row by given index', () => {
      cy.gridInstance().invoke('getRowAt', 0).should('have.subset', getRowDataWithAttrs(1));

      cy.gridInstance().invoke('getRowAt', 1).should('have.subset', getRowDataWithAttrs(2));
    });

    it('should return row by given index regardless of filtering the data', () => {
      cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'Lee' }]);

      cy.gridInstance().invoke('getRowAt', 0).should('have.subset', getRowDataWithAttrs(1));

      cy.gridInstance().invoke('getRowAt', 1).should('have.subset', getRowDataWithAttrs(2));
    });
  });

  context('getIndexOfRow()', () => {
    it('should return the index of the row matching given rowKey', () => {
      cy.gridInstance().invoke('getIndexOfRow', 0).should('eq', 0);

      cy.gridInstance().invoke('getIndexOfRow', 1).should('eq', 1);
    });

    it('should return the index of the row matching given rowKey regardless of filtering the data', () => {
      cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'Lee' }]);

      cy.gridInstance().invoke('getIndexOfRow', 0).should('eq', 0);
    });

    it('should return the index of the row matching given rowKey after appedngind the row and clearing modified data', () => {
      cy.gridInstance().invoke('appendRow', { name: 'Ryu', age: 10 }, { at: 1 });
      cy.gridInstance().invoke('clearModifiedData');

      cy.gridInstance().invoke('getIndexOfRow', 2).should('have.subset', 1);
    });
  });

  it('getData() returns all rows', () => {
    cy.gridInstance()
      .invoke('getData')
      .should('have.subset', [getRowDataWithAttrs(1), getRowDataWithAttrs(2)]);
  });

  it('getFilteredData() returns filtered rows', () => {
    cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'Lee' }]);
    cy.gridInstance()
      .invoke('getFilteredData')
      .should('have.subset', [getRowDataWithAttrs(2)]);
  });

  it('getRowCount() returns the total number of the rows', () => {
    cy.gridInstance().invoke('getRowCount').should('eq', 2);
  });
});

describe('rows', () => {
  it('findRows() returns rows that meet the conditions.', () => {
    createGrid();

    cy.gridInstance()
      .invoke('findRows', { name: 'Kim' })
      .should('have.length', 1)
      .its('0')
      .and('have.subset', { name: 'Kim', age: 10 });

    cy.gridInstance().invoke('findRows', { name: 'Lee', age: 10 }).should('have.length', 0);

    cy.gridInstance()
      .invoke('findRows', (row: Row) => !!row.age && row.age > 10)
      .should('have.length', 1)
      .its('0')
      .and('have.subset', { name: 'Lee', age: 20 });
  });
});

describe('setRow()', () => {
  it('should not replace the row when target rowKey does not exist in grid', () => {
    createGrid();

    cy.gridInstance().invoke('setRow', 2, { name: 'Han', age: 30 });

    cy.getCellByIdx(1, 0).should('have.text', 'Lee');
    cy.getCellByIdx(1, 1).should('have.text', '20');
  });

  it('should replace the row to option row data', () => {
    createGrid();

    cy.gridInstance().invoke('setRow', 1, { name: 'Han', age: 30 });

    cy.getCellByIdx(1, 0).should('have.text', 'Han');
    cy.getCellByIdx(1, 1).should('have.text', '30');
  });

  it('should sort state is maintained when calls setRow API', () => {
    createGrid();

    cy.gridInstance().invoke('sort', 'name', true);
    cy.gridInstance().invoke('sort', 'age', false, true);
    cy.gridInstance().invoke('setRow', 1, {
      name: 'Ryu',
      age: '20',
    });

    cy.gridInstance()
      .invoke('getSortState')
      .should('have.subset', {
        columns: [
          { columnName: 'name', ascending: true },
          { columnName: 'age', ascending: false },
        ],
      });
  });

  it('should replaced row is ordered properly even if sorted the data', () => {
    createGrid();

    cy.gridInstance().invoke('sort', 'name', false);
    cy.gridInstance().invoke('setRow', 1, {
      name: 'Ryu',
      age: '20',
    });

    // check the position based on sorted data
    cy.getCellByIdx(0, 0).should('have.text', 'Ryu');
    cy.getCellByIdx(0, 1).should('have.text', '20');

    cy.gridInstance().invoke('unsort');

    // check the position based on origin data
    cy.getCellByIdx(1, 0).should('have.text', 'Ryu');
    cy.getCellByIdx(1, 1).should('have.text', '20');
  });

  it('header checkbox state changes after calling setRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });
    cy.gridInstance().invoke('disableRowCheck', 0);

    assertHeaderCheckboxDisabled(false);

    cy.gridInstance().invoke('setRow', 1, {
      name: 'han',
      age: 29,
      _attributes: { checkDisabled: true },
    });

    assertHeaderCheckboxDisabled(true);
  });

  it('should check the header checkbox of added data after calling setRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('setRow', 1, { name: 'han', age: 29, _attributes: { checked: true } });

    assertCheckboxStatus(true);
  });

  it('should not check the header checkbox of non checked added data after calling setRow()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('setRow', 1, { name: 'han', age: 29 });

    assertHeaderCheckboxStatus(false);
  });

  it('should make empty row overservable', () => {
    createGrid();

    cy.gridInstance().invoke('setRow', 1, {});
    cy.gridInstance().invoke('setValue', 1, 'name', 'observable');

    cy.getCell(1, 'name').should('have.text', 'observable');
  });

  it('should destroy the focusing layer, only when row will be filtered', () => {
    createGrid();
    cy.gridInstance().invoke('setFilter', 'age', 'number');
    invokeFilter('age', [{ code: 'gt', value: 5 }]);

    cy.getCellByIdx(0, 0).click();

    cy.gridInstance().invoke('setValue', 0, 'age', '6');

    cy.getByCls('layer-focus').should('exist');

    cy.gridInstance().invoke('setValue', 0, 'age', '0');

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { columnName: null, rowKey: null, value: null });
  });
});

describe('setRows()', () => {
  it('should replace rows', () => {
    createGrid();

    cy.gridInstance().invoke('setRows', [
      {
        rowKey: 0,
        name: 'Cha',
        age: '30',
      },
      {
        rowKey: 1,
        name: 'Ryu',
        age: '20',
      },
    ]);

    cy.getCellByIdx(0, 0).should('have.text', 'Cha');
    cy.getCellByIdx(0, 1).should('have.text', '30');
    cy.getCellByIdx(1, 0).should('have.text', 'Ryu');
    cy.getCellByIdx(1, 1).should('have.text', '20');
  });

  it('should sort state is maintained when calls setRows API', () => {
    createGrid();

    cy.gridInstance().invoke('sort', 'name', true);
    cy.gridInstance().invoke('sort', 'age', false, true);
    cy.gridInstance().invoke('setRows', [
      {
        rowKey: 1,
        name: 'Ryu',
        age: '20',
      },
    ]);

    cy.gridInstance()
      .invoke('getSortState')
      .should('have.subset', {
        columns: [
          { columnName: 'name', ascending: true },
          { columnName: 'age', ascending: false },
        ],
      });
  });

  it('should replaced rows are ordered properly even if sorted the data', () => {
    createGrid();

    cy.gridInstance().invoke('sort', 'name', false);
    cy.gridInstance().invoke('setRows', [
      {
        rowKey: 1,
        name: 'Ryu',
        age: '20',
      },
    ]);

    // check the position based on sorted data
    cy.getCellByIdx(0, 0).should('have.text', 'Ryu');
    cy.getCellByIdx(0, 1).should('have.text', '20');

    cy.gridInstance().invoke('unsort');

    // check the position based on origin data
    cy.getCellByIdx(1, 0).should('have.text', 'Ryu');
    cy.getCellByIdx(1, 1).should('have.text', '20');
  });

  it('header checkbox state changes after calling setRows()', () => {
    createGrid({ rowHeaders: ['checkbox'] });
    cy.gridInstance().invoke('disableRowCheck', 0);

    assertHeaderCheckboxDisabled(false);

    cy.gridInstance().invoke('setRows', [
      {
        rowKey: 1,
        name: 'han',
        age: 29,
        _attributes: { checkDisabled: true },
      },
    ]);

    assertHeaderCheckboxDisabled(true);
  });

  it('should check the header checkbox of added data after calling setRows()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');

    assertCheckboxStatus(true);

    cy.gridInstance().invoke('setRows', [
      {
        rowKey: 1,
        name: 'han',
        age: 29,
        _attributes: { checked: true },
      },
    ]);

    assertCheckboxStatus(true);
  });

  it('should not check the header checkbox of non checked added data after calling setRows()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('setRows', [{ rowKey: 1, name: 'han', age: 29 }]);

    assertHeaderCheckboxStatus(false);
  });

  it('should replace filtered rows correctly when a filter is applied', () => {
    createGrid();
    cy.gridInstance().invoke('setFilter', 'name', 'select');
    invokeFilter('name', [{ code: 'eq', value: 'Lee' }]);

    cy.gridInstance().invoke('setRows', [{ rowKey: 1, name: 'Han', age: 29 }]);

    cy.gridInstance().invoke('getFilteredData').should('have.length', 0);
  });
});

describe('moveRow()', () => {
  beforeEach(() => {
    createGridWithLargeData();
  });

  ['sort', 'filter'].forEach((type) => {
    it(`if ${type} data, moving should not be executed`, () => {
      if (type === 'sort') {
        cy.gridInstance().invoke('sort', 'name', true);
      } else {
        cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'Lee' }]);
      }

      cy.gridInstance().invoke('moveRow', 1, 3);

      if (type === 'sort') {
        cy.gridInstance().invoke('unsort');
      } else {
        cy.gridInstance().invoke('unfilter', 'name');
      }

      cy.getCellByIdx(3, 0).should('have.text', 'Han');
      cy.getCellByIdx(3, 1).should('have.text', '40');
    });
  });

  it('should move row to target index', () => {
    cy.gridInstance().invoke('moveRow', 3, 1);
    cy.gridInstance().invoke('unsort');

    cy.getCellByIdx(1, 0).should('have.text', 'Han');
    cy.getCellByIdx(2, 0).should('have.text', 'Lee');
    cy.getCellByIdx(3, 0).should('have.text', 'Ryu');

    cy.getCellByIdx(1, 1).should('have.text', '40');
    cy.getCellByIdx(2, 1).should('have.text', '20');
    cy.getCellByIdx(3, 1).should('have.text', '30');
  });
});

it('row._attributes should be maintained on calling resetData', () => {
  const data = [
    {
      name: 'Kim',
      age: 10,
      _attributes: {
        checked: true,
      },
    },
    { name: 'Lee', age: 20 },
  ];
  const columns = [{ name: 'name' }, { name: 'age' }];

  cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });
  cy.gridInstance().invoke('resetData', data);

  cy.getRowHeaderCell(0, '_checked').find('input').should('be.checked');
});

describe('appendRows()', () => {
  it('should append rows to existing data', () => {
    createGrid();

    cy.gridInstance().invoke('appendRows', [
      { name: 'Han', age: 21 },
      { name: 'Ryu', age: 25 },
    ]);

    cy.getRsideBody().should('have.cellData', [
      ['Kim', '10'],
      ['Lee', '20'],
      ['Han', '21'],
      ['Ryu', '25'],
    ]);
  });

  it('should maintain the sort state after calling appendRows()', () => {
    createGrid();

    cy.gridInstance().invoke('sort', 'name', true);
    cy.gridInstance().invoke('appendRows', [
      { name: 'Han', age: 21 },
      { name: 'Ryu', age: 25 },
    ]);

    cy.getRsideBody().should('have.cellData', [
      ['Han', '21'],
      ['Kim', '10'],
      ['Lee', '20'],
      ['Ryu', '25'],
    ]);
  });

  it('should maintain the filter state after calling appendRows()', () => {
    createGrid();

    cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'Lee' }]);
    cy.gridInstance().invoke('appendRows', [
      { name: 'Lee', age: 30 },
      { name: 'Lee', age: 40 },
    ]);

    cy.getRsideBody().should('have.cellData', [
      ['Lee', '20'],
      ['Lee', '30'],
      ['Lee', '40'],
    ]);
  });

  it('header checkbox state changes after calling appendRows()', () => {
    createGrid({ rowHeaders: ['checkbox'], disabled: true });

    assertHeaderCheckboxDisabled(true);

    cy.gridInstance().invoke('appendRows', [
      { name: 'han', age: 29 },
      { name: 'jung', age: 29 },
    ]);

    assertHeaderCheckboxDisabled(false);
  });

  it('should check the header checkbox of added data after calling appendRows()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('appendRows', [
      { name: 'Lee', age: 30, _attributes: { checked: true } },
      { name: 'Lee', age: 40, _attributes: { checked: true } },
    ]);

    assertCheckboxStatus(true);
  });

  it('should not check the header checkbox of non checked added data after calling appendRows()', () => {
    createGrid({ rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('appendRows', [
      { name: 'Lee', age: 30, _attributes: { checked: true } },
      { name: 'Lee', age: 40 },
    ]);

    assertHeaderCheckboxStatus(false);
  });

  it('should add appended rows to modified data', () => {
    createGrid();

    cy.gridInstance().invoke('appendRows', [
      { name: 'Han', age: 21 },
      { name: 'Ryu', age: 25 },
    ]);

    cy.gridInstance().invoke('getModifiedRows').its('createdRows').should('have.length', 2);
  });
});

describe('setValue()', () => {
  beforeEach(() => {
    const columns = [{ name: 'name' }, { name: 'age' }];
    // @ts-ignore
    createGrid({ columns });
  });

  it('should change the value of the cell', () => {
    cy.gridInstance().invoke('setValue', 0, 'name', 'Han');

    cy.getRsideBody().should('have.cellData', [
      ['Han', '10'],
      ['Lee', '20'],
    ]);
  });

  it('should not change the value of the cell with checkCellState', () => {
    cy.gridInstance().invoke('setValue', 0, 'name', 'Han', true);

    cy.getRsideBody().should('have.cellData', [
      ['Kim', '10'],
      ['Lee', '20'],
    ]);
  });

  it('should destroy the focusing layer, only when row will be filtered', () => {
    cy.gridInstance().invoke('setFilter', 'age', 'number');
    invokeFilter('age', [{ code: 'gt', value: 5 }]);

    cy.getCellByIdx(0, 0).click();

    cy.gridInstance().invoke('setValue', 0, 'age', '6');

    cy.getByCls('layer-focus').should('exist');

    cy.gridInstance().invoke('setValue', 0, 'age', '0');

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { columnName: null, rowKey: null, value: null });
  });
});

it('should change the value of the hidden cell', () => {
  const onBeforeChange = cy.stub();
  const onAfterChange = cy.stub();
  const columns = [
    { name: 'name' },
    { name: 'age' },
    { name: 'gender', hidden: true, onBeforeChange, onAfterChange },
  ];
  const data = [
    { name: 'Kim', age: 10, gender: 'female' },
    { name: 'Lee', age: 20, gender: 'male' },
  ];
  // @ts-ignore
  createGrid({ columns, data });

  cy.gridInstance().invoke('setValue', 0, 'gender', 'male');

  cy.gridInstance().invoke('getValue', 0, 'gender').should('eq', 'male');
  cy.wrap(onBeforeChange).should('be.calledWithMatch', {
    rowKey: 0,
    columnName: 'gender',
    value: 'female',
    nextValue: 'male',
  });
  cy.wrap(onAfterChange).should('be.calledWithMatch', {
    rowKey: 0,
    columnName: 'gender',
    value: 'male',
    prevValue: 'female',
  });
});

describe('getValue()', () => {
  it('should get the value of the cell', () => {
    createGrid();
    cy.gridInstance().invoke('getValue', 0, 'name').should('eq', 'Kim');
  });

  it('should get the value of the filtered cell', () => {
    createGrid();
    invokeFilter('name', [{ code: 'eq', value: 'Lee' }]);

    cy.gridInstance().invoke('getValue', 0, 'name').should('eq', 'Kim');
  });

  it('should return null when there is no matched rowKey', () => {
    createGrid();
    cy.gridInstance().invoke('getValue', 3, 'name').should('eq', null);
  });

  it('should return null when there is no matched columnName', () => {
    createGrid();
    cy.gridInstance().invoke('getValue', 0, 'none').should('eq', null);
  });

  it('should return falsy value properly', () => {
    const data = [
      { name: 'Kim', age: 10 },
      { name: 'Lee', age: 20 },
      { name: 'Han', age: 0 },
    ];
    createGrid({ data });

    cy.gridInstance().invoke('getValue', 2, 'age').should('eq', 0);
  });
});

describe('getFormattedValue()', () => {
  beforeEach(() => {
    const columns = [
      {
        name: 'name',
        formatter({ value }: FormatterProps) {
          return `formatted${value}`;
        },
      },
      { name: 'age' },
    ];
    // @ts-ignore
    createGrid({ columns });
  });

  it('should get the formatted value of the cell', () => {
    cy.gridInstance().invoke('getFormattedValue', 0, 'name').should('eq', 'formattedKim');
  });

  it('should get the formatted value of the filtered cell', () => {
    invokeFilter('name', [{ code: 'eq', value: 'Lee' }]);

    cy.gridInstance().invoke('getFormattedValue', 0, 'name').should('eq', 'formattedKim');
  });

  it('should return null when there is no matched rowKey ', () => {
    cy.gridInstance().invoke('getFormattedValue', 3, 'name').should('eq', null);
  });

  it('should return null when there is no matched columnName ', () => {
    cy.gridInstance().invoke('getFormattedValue', 0, 'none').should('eq', null);
  });
});

describe('D&D', () => {
  function getActiveFocusLayer() {
    return cy.getByCls('layer-focus');
  }

  describe('Row', () => {
    beforeEach(() => {
      const largeData = [
        { name: 'Kim', age: 10 },
        { name: 'Lee', age: 20 },
        { name: 'Ryu', age: 30 },
        { name: 'Han', age: 40 },
      ];
      const columns = [
        { name: 'name', editor: 'text', sortable: true, filter: 'text' },
        { name: 'age', editor: 'text', sortable: true },
      ];

      cy.createGrid({ data: largeData, columns, scrollY: true, bodyHeight: 400, draggable: true });
    });

    it('should move the row by dragging the row(bottom direction)', () => {
      cy.getRsideBody().should('have.cellData', [
        ['Kim', '10'],
        ['Lee', '20'],
        ['Ryu', '30'],
        ['Han', '40'],
      ]);

      dragAndDropRow(1, 140);

      cy.getRsideBody().should('have.cellData', [
        ['Kim', '10'],
        ['Ryu', '30'],
        ['Lee', '20'],
        ['Han', '40'],
      ]);
    });

    it('should move the row by dragging the row(top direction)', () => {
      cy.getRsideBody().should('have.cellData', [
        ['Kim', '10'],
        ['Lee', '20'],
        ['Ryu', '30'],
        ['Han', '40'],
      ]);

      dragAndDropRow(1, 40);

      cy.getRsideBody().should('have.cellData', [
        ['Lee', '20'],
        ['Kim', '10'],
        ['Ryu', '30'],
        ['Han', '40'],
      ]);
    });

    it('should remove the focus when triggering mousedown to drag element', () => {
      cy.gridInstance().invoke('focus', 1, 'name');

      dragAndDropRow(1, 40);

      getActiveFocusLayer().should('not.exist');
    });
  });
});

describe('enableCell() / disableCell()', () => {
  beforeEach(() => {
    createGrid();
  });
  it('should disable cell after calling disableCell() and enable cell after calling enableCell()', () => {
    createGrid();
    cy.gridInstance().invoke('disableCell', 0, 'name');

    cy.getCell(0, 'name').should('have.class', cls('cell-disabled'));

    cy.gridInstance().invoke('enableCell', 0, 'name');

    cy.getCell(0, 'name').should('have.not.class', cls('cell-disabled'));
  });

  it('should not disable cell if it row number cell or draggable cell', () => {
    createGrid({ rowHeaders: [{ type: 'rowNum' }], draggable: true });

    cy.gridInstance().invoke('disableCell', 0, '_number');
    cy.gridInstance().invoke('disableCell', 0, '_draggable');

    cy.getRowHeaderCell(0, '_number').should('have.not.class', cls('cell-disabled'));
    cy.getRowHeaderCell(0, '_draggable').should('have.not.class', cls('cell-disabled'));
  });

  it('should disable check box after calling disableCell() to check box cell', () => {
    createGrid({ rowHeaders: [{ type: 'checkbox' }] });

    cy.gridInstance().invoke('disableCell', 0, '_checked');

    cy.getRowHeaderCell(0, '_checked').should('have.class', cls('cell-disabled'));
  });
});
