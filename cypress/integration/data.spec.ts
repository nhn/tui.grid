import { cls } from '@/helper/dom';
import { OptRow } from '@/types';
import { Row } from '@/store/types';

const data = [{ name: 'Kim', age: 10 }, { name: 'Lee', age: 20 }];
const columns = [{ name: 'name', editor: 'text' }, { name: 'age', editor: 'text' }];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });

  cy.createGrid({ data, columns });
});

describe('appendRow()', () => {
  it('append a row at the end of the data', () => {
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });

    cy.getCellByIdx(2, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(2, 1).should('to.have.text', '30');
  });

  it('if at option exist, insert a row at the given index', () => {
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 }, { at: 1 });

    cy.getCellByIdx(2, 0).should('have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('have.text', '20');
    cy.getCellByIdx(1, 0).should('have.text', 'Park');
    cy.getCellByIdx(1, 1).should('have.text', '30');
  });

  it('if focus option exist, set focus to the first cell of the inserted row', () => {
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
    cy.gridInstance().invoke('appendRow');
    cy.getCellByIdx(2, 0).should('to.have.text', '');
    cy.getCellByIdx(2, 1).should('to.have.text', '');
  });
});

describe('prependRow()', () => {
  it('insert a row at the start of the data', () => {
    cy.gridInstance().invoke('prependRow', { name: 'Park', age: 30 });

    cy.getCellByIdx(2, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('to.have.text', '20');
    cy.getCellByIdx(0, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(0, 1).should('to.have.text', '30');
    cy.getCellByIdx(1, 0).should('to.have.text', 'Kim');
    cy.getCellByIdx(1, 1).should('to.have.text', '10');
  });

  it('if focus option exist, set focus to the first cell of the inserted row', () => {
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
    cy.gridInstance().invoke('prependRow');

    cy.wait(10);
    cy.getCellByIdx(0, 0).should('to.have.text', '');
    cy.getCellByIdx(0, 1).should('to.have.text', '');
  });
});

describe('removeRow()', () => {
  it('remove a row matching given rowKey', () => {
    cy.gridInstance().invoke('removeRow', 0);

    cy.wait(10);
    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
  });

  it('remove a row when focus layer is active', () => {
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
    cy.gridInstance().invoke('startEditing', 1, 'name', true);
    cy.gridInstance().invoke('removeRow', 0);

    cy.wait(10);
    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
    cy.get(`.${cls('layer-editing')}`).should('be.visible');
  });

  it('remove a row included focus cell', () => {
    cy.gridInstance().invoke('focus', 0, 'name', true);
    cy.gridInstance().invoke('removeRow', 0);
    cy.gridInstance()
      .invoke('getFocusedCell')
      .then(res => {
        expect(res).to.eql({ rowKey: null, columnName: null, value: null });
      });
  });
});

describe('removeCheckedRows()', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });

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
    cy.gridInstance().invoke('clear');

    cy.get(`.${cls('body-area')} .${cls('cell')}`).should('not.exist');
  });

  it('focus, editing cell is removed when clears all data', () => {
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
  it('reset all data', () => {
    cy.gridInstance().invoke('resetData', [{ name: 'Park', age: 30 }, { name: 'Han', age: 40 }]);

    cy.getCellByIdx(0, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(0, 1).should('to.have.text', '30');
    cy.getCellByIdx(1, 0).should('to.have.text', 'Han');
    cy.getCellByIdx(1, 1).should('to.have.text', '40');
  });

  it('focus, editing cell is removed when resets all data', () => {
    cy.gridInstance().invoke('startEditingAt', 0, 1);
    cy.gridInstance().invoke('resetData', [{ name: 'Park', age: 30 }, { name: 'Han', age: 40 }]);
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

describe('getters', () => {
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
