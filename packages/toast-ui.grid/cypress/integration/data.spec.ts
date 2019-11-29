import { cls } from '@/helper/dom';
import { OptRow } from '@/types';
import { Row } from '@/store/types';

const data = [
  { name: 'Kim', age: 10 },
  { name: 'Lee', age: 20 }
];
const largeData = [
  { name: 'Kim', age: 10 },
  { name: 'Lee', age: 20 },
  { name: 'Ryu', age: 30 },
  { name: 'Han', age: 40 }
];
const columns = [
  { name: 'name', editor: 'text', sortable: true, filter: 'text' },
  { name: 'age', editor: 'text', sortable: true }
];
const defaultGridOptions = { data, columns, scrollY: true, bodyHeight: 400 };

function checkGridHasRightRowNumber() {
  cy.get('td[data-column-name=_number]').each(($el, idx) => {
    expect($el.text()).to.contain(`${idx + 1}`);
  });
}

before(() => {
  cy.visit('/dist');
});

describe('appendRow()', () => {
  it('append a row at the end of the data', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });

    cy.getCellByIdx(2, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(2, 1).should('to.have.text', '30');
  });

  it('if at option exist, insert a row at the given index', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 }, { at: 1 });

    cy.getCellByIdx(2, 0).should('have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('have.text', '20');
    cy.getCellByIdx(1, 0).should('have.text', 'Park');
    cy.getCellByIdx(1, 1).should('have.text', '30');
  });

  it('if focus option exist, set focus to the first cell of the inserted row', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 }, { focus: true });

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        rowKey: 2,
        columnName: 'name',
        value: 'Park'
      });
  });

  it('if first argument is undefined, insert empty object', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('appendRow');
    cy.getCellByIdx(2, 0).should('to.have.text', '');
    cy.getCellByIdx(2, 1).should('to.have.text', '');
  });

  it('rowKey is created properly as max index', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('removeRow', 0);
    cy.gridInstance().invoke('appendRow', { name: 'Kim', age: 40 });
    cy.gridInstance()
      .invoke('getRowAt', 1)
      .should(row => {
        expect(row.rowKey).to.be.eq(2);
      });
  });

  it('rowKey is created properly as max index on empty grid', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('resetData', []);
    cy.gridInstance().invoke('appendRow', { name: 'Kim', age: 40 });
    cy.gridInstance()
      .invoke('getRowAt', 0)
      .should(row => {
        expect(row.rowKey).to.be.eq(0);
      });
  });

  it('should insert empty value for each column as append the empty row', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('appendRow', {});

    cy.gridInstance()
      .invoke('getModifiedRows')
      .should(res => {
        const appendedRow = res.createdRows[0];
        expect(appendedRow).to.contain({ name: '', age: '' });
      });
  });

  it('should update row number when calling appendRow()', () => {
    cy.createGrid({ data: largeData, columns, bodyHeight: 400, rowHeaders: ['rowNum'] });

    cy.gridInstance().invoke('appendRow', { name: 'Yoo', age: 50 }, { at: 2 });
    checkGridHasRightRowNumber();
  });

  it('should maintain the sort state when calling appendRow()', () => {
    cy.createGrid({ data: largeData, columns, bodyHeight: 400 });

    cy.gridInstance().invoke('sort', 'name', true);
    cy.gridInstance().invoke('appendRow', { name: 'Yoo', age: 50 });

    cy.gridInstance()
      .invoke('getSortState')
      .should('have.subset', { columns: [{ columnName: 'name', ascending: true }] });
  });
});

describe('prependRow()', () => {
  it('insert a row at the start of the data', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('prependRow', { name: 'Park', age: 30 });

    cy.getCellByIdx(2, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('to.have.text', '20');
    cy.getCellByIdx(0, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(0, 1).should('to.have.text', '30');
    cy.getCellByIdx(1, 0).should('to.have.text', 'Kim');
    cy.getCellByIdx(1, 1).should('to.have.text', '10');
  });

  it('if focus option exist, set focus to the first cell of the inserted row', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('prependRow', { name: 'Park', age: 30 }, { focus: true });

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        rowKey: 2,
        columnName: 'name',
        value: 'Park'
      });
  });

  it('if first argument is undefined, insert empty object', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('prependRow');

    cy.wait(10);
    cy.getCellByIdx(0, 0).should('to.have.text', '');
    cy.getCellByIdx(0, 1).should('to.have.text', '');
  });

  it('should update row number when calling prependRow()', () => {
    cy.createGrid({ data: largeData, columns, bodyHeight: 400, rowHeaders: ['rowNum'] });

    cy.gridInstance().invoke('prependRow', { name: 'Yoo', age: 50 });
    checkGridHasRightRowNumber();
  });
});

describe('removeRow()', () => {
  it('remove a row matching given rowKey', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('removeRow', 0);

    cy.wait(10);
    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
  });

  it('remove a row when focus layer is active', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('focus', 1, 'name', true);
    cy.gridInstance().invoke('removeRow', 0);

    cy.wait(10);
    cy.gridInstance()
      .invoke('getFocusedCell')
      .should(res => {
        expect(res).to.eql({ rowKey: 1, columnName: 'name', value: 'Lee' });
      });
    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
  });

  it('remove a row when editing layer is active', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('startEditing', 1, 'name', true);
    cy.gridInstance().invoke('removeRow', 0);

    cy.wait(10);
    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
    cy.get(`.${cls('layer-editing')}`).should('be.visible');
  });

  it('remove a row included focus cell', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('focus', 0, 'name', true);
    cy.gridInstance().invoke('removeRow', 0);
    cy.gridInstance()
      .invoke('getFocusedCell')
      .then(res => {
        expect(res).to.eql({ rowKey: null, columnName: null, value: null });
      });
  });

  it('should reduce the height after removing the row', () => {
    cy.createGrid({ data, columns, bodyHeight: 50, minBodyHeight: 50 });
    cy.get(`.${cls('body-container')}`)
      .invoke('height')
      .then(prevHeight => {
        cy.gridInstance().invoke('removeRow', 1);
        cy.get('.tui-grid-body-area')
          .invoke('height')
          .should('be.lt', prevHeight);
      });
  });

  it('should update row number when calling removeRow()', () => {
    cy.createGrid({ data: largeData, columns, bodyHeight: 400, rowHeaders: ['rowNum'] });

    cy.gridInstance().invoke('removeRow', 2);
    checkGridHasRightRowNumber();
  });
});

describe('removeCheckedRows()', () => {
  beforeEach(() => {
    cy.createGrid({
      data,
      columns,
      rowHeaders: ['_checked']
    });
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
    cy.gridInstance()
      .invoke('removeCheckedRows', true)
      .then(() => {
        expect(stub.args[0][0]).to.be.eql('Are you sure you want to delete 1 data?');
      });
  });

  it('use confirm cancel.', () => {
    cy.on('window:confirm', () => false);
    cy.gridInstance().invoke('check', 1);
    cy.gridInstance()
      .invoke('removeCheckedRows', true)
      .then(() => {
        cy.getCell(1, 'name').should('exist');
      });
  });
});

describe('clear()', () => {
  it('remove all rows', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('clear');

    cy.get(`.${cls('body-area')} .${cls('cell')}`).should('not.exist');
  });

  it('focus, editing cell is removed when clears all data', () => {
    cy.createGrid(defaultGridOptions);
    cy.gridInstance().invoke('startEditingAt', 0, 1);
    cy.gridInstance().invoke('clear');

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        rowKey: null,
        columnName: null,
        value: null
      });
    cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
  });
});

describe('resetData()', () => {
  beforeEach(() => {
    cy.createGrid(defaultGridOptions);
  });

  it('focus, editing cell is removed when resets all data', () => {
    cy.gridInstance().invoke('resetData', [
      { name: 'Park', age: 30 },
      { name: 'Han', age: 40 }
    ]);
    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        rowKey: null,
        columnName: null,
        value: null
      });
    cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
  });

  it('sync the position of scroll when resets all data', () => {
    cy.gridInstance().invoke(
      'resetData',
      Array.from({ length: 20 }).map((_, index) => ({ name: `Park${index}`, age: 30 }))
    );

    cy.get(`.${cls('rside-area')} .${cls('body-area')}`).scrollTo(0, 800);

    cy.gridInstance().invoke('resetData', [
      { name: 'Park', age: 30 },
      { name: 'Han', age: 40 }
    ]);

    cy.get(`.${cls('rside-area')} .${cls('body-container')}`).should($container => {
      expect($container.height()).to.lessThan(800);
    });
  });
});

describe('getters', () => {
  beforeEach(() => {
    cy.createGrid(defaultGridOptions);
  });

  function getRowDataWithAttrs(row: OptRow, rowNum: number) {
    return {
      ...row,
      _attributes: {
        checkDisabled: false,
        checked: false,
        disabled: false,
        className: {
          row: [],
          column: {}
        },
        rowNum,
        // eslint-disable-next-line no-undefined
        rowSpan: undefined
      }
    };
  }

  it('getRow() returns row matching given rowKey', () => {
    cy.gridInstance()
      .invoke('getRow', 0)
      .should('eql', getRowDataWithAttrs(data[0], 1));

    cy.gridInstance()
      .invoke('getRow', 1)
      .should('eql', getRowDataWithAttrs(data[1], 2));
  });

  it('getRowAt() returns row indexed by given index', () => {
    cy.gridInstance()
      .invoke('getRowAt', 0)
      .should('eql', getRowDataWithAttrs(data[0], 1));

    cy.gridInstance()
      .invoke('getRowAt', 1)
      .should('eql', getRowDataWithAttrs(data[1], 2));
  });

  it('getIndexOfRow() returns the index of the row matching given rowKey', () => {
    cy.gridInstance()
      .invoke('getIndexOfRow', 0)
      .should('eql', 0);

    cy.gridInstance()
      .invoke('getIndexOfRow', 1)
      .should('eql', 1);
  });

  it('getData() returns all rows', () => {
    cy.gridInstance()
      .invoke('getData')
      .should('eql', [getRowDataWithAttrs(data[0], 1), getRowDataWithAttrs(data[1], 2)]);
  });

  it('getRowCount() returns the total number of the rows', () => {
    cy.gridInstance()
      .invoke('getRowCount')
      .should('eq', 2);
  });
});

describe('rows', () => {
  it('findRows() returns rows that meet the conditions.', () => {
    cy.createGrid(defaultGridOptions);

    cy.gridInstance()
      .invoke('findRows', { name: 'Kim' })
      .then(res => {
        expect(res).to.have.length(1);
        expect(res[0]).to.contain({ name: 'Kim', age: 10 });
      });

    cy.gridInstance()
      .invoke('findRows', { name: 'Lee', age: 10 })
      .should('have.length', 0);

    cy.gridInstance()
      .invoke('findRows', function(row: Row) {
        return !!row.age && row.age > 10;
      })
      .then(res => {
        expect(res).to.have.length(1);
        expect(res[0]).to.contain({ name: 'Lee', age: 20 });
      });
  });
});

describe('focus', () => {
  beforeEach(() => {
    cy.createGrid(defaultGridOptions);
  });

  it('should destroy the focusing layer, when hide the column', () => {
    cy.gridInstance().invoke('focus', 1, 'name', true);
    cy.gridInstance().invoke('hideColumn', 'name');
    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        columnName: null,
        rowKey: null,
        value: null
      });
  });

  it('cannot focus the cell on hidden cell', () => {
    cy.gridInstance().invoke('hideColumn', 'name');
    cy.gridInstance().invoke('focus', 1, 'name');

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        columnName: null,
        rowKey: null,
        value: null
      });
  });
});

describe('setRow', () => {
  it('should not replace the row when target rowKey does not exist in grid', () => {
    cy.createGrid(defaultGridOptions);

    cy.gridInstance().invoke('setRow', 2, { name: 'Han', age: 30 });

    cy.getCellByIdx(1, 0).should('have.text', 'Lee');
    cy.getCellByIdx(1, 1).should('have.text', '20');
  });

  it('should replace the row to option row data', () => {
    cy.createGrid(defaultGridOptions);

    cy.gridInstance().invoke('setRow', 1, { name: 'Han', age: 30 });

    cy.getCellByIdx(1, 0).should('have.text', 'Han');
    cy.getCellByIdx(1, 1).should('have.text', '30');
  });

  it('should replaced row is ordered properly even if sorted the data', () => {
    cy.createGrid(defaultGridOptions);

    cy.gridInstance().invoke('sort', 'name', false);
    cy.gridInstance().invoke('setRow', 1, {
      name: 'Ryu',
      age: '20'
    });

    // check the position based on sorted data
    cy.getCellByIdx(0, 0).should('have.text', 'Ryu');
    cy.getCellByIdx(0, 1).should('have.text', '20');

    cy.gridInstance().invoke('unsort');

    // check the position based on origin data
    cy.getCellByIdx(1, 0).should('have.text', 'Ryu');
    cy.getCellByIdx(1, 1).should('have.text', '20');
  });
});

describe('moveRow', () => {
  beforeEach(() => {
    cy.createGrid({ data: largeData, columns });
  });

  ['sort', 'filter'].forEach(type => {
    it(`if ${type} data, moving should not be excuted`, () => {
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
