import { cls } from '@/helper/dom';

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });

  cy.createGrid({ data, columns });
});

const data = [{ name: 'Kim', age: 10 }, { name: 'Lee', age: 20 }];
const columns = [{ name: 'name' }, { name: 'age' }];

describe('appendRow()', () => {
  it('append a row at the end of the data', () => {
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });

    cy.getCellByIdx(2, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(2, 1).should('to.have.text', '30');
  });

  it('if at option exist, insert a jrow at the given index', () => {
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 }, { at: 1 });

    cy.getCellByIdx(1, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(1, 1).should('to.have.text', '30');
    cy.getCellByIdx(2, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('to.have.text', '20');
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

    cy.getCellByIdx(0, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(0, 1).should('to.have.text', '30');
    cy.getCellByIdx(1, 0).should('to.have.text', 'Kim');
    cy.getCellByIdx(1, 1).should('to.have.text', '10');
    cy.getCellByIdx(2, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('to.have.text', '20');
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

    cy.getCellByIdx(0, 0).should('to.have.text', '');
    cy.getCellByIdx(0, 1).should('to.have.text', '');
  });
});

describe('removeRow()', () => {
  it('remove a row matching given rowKey', () => {
    cy.gridInstance().invoke('removeRow', 0);

    cy.getCellByIdx(0, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(0, 1).should('to.have.text', '20');
  });
});

describe('clear()', () => {
  it('remove all rows', () => {
    cy.gridInstance().invoke('clear');

    cy.get(`.${cls('body-area')} .${cls('cell')}`).should('not.exist');
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
});

describe('getters', () => {
  it('getRow() returns row matching given rowKey', () => {
    const defaultAttr = {
      checkDisabled: false,
      checked: false,
      disabled: false
    };

    cy.gridInstance()
      .invoke('getRow', 0)
      .should('eql', {
        rowKey: 0,
        name: 'Kim',
        age: 10,
        _attributes: {
          ...defaultAttr,
          rowNum: 1
        }
      });

    cy.gridInstance()
      .invoke('getRow', 1)
      .should('eql', {
        rowKey: 1,
        name: 'Lee',
        age: 20,
        _attributes: {
          ...defaultAttr,
          rowNum: 2
        }
      });
  });
});
