import { cls } from '@/helper/dom';

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  const columns = [{ name: 'id' }, { name: 'name' }];
  const data = [
    { id: 1, name: 'Kim', score: 90, grade: 'A' },
    { id: 2, name: 'Lee', score: 80, grade: 'B' },
  ];
  cy.createGrid({ data, columns });
});

function getActiveFocusLayer() {
  return cy.getByCls('layer-focus');
}

function getInactiveFocusLayer() {
  return cy.getByCls('layer-focus-deactive');
}

function makeInactiveFocusLayer() {
  cy.getByCls('clipboard').focus();
  cy.getByCls('clipboard').blur();
}

describe('API', () => {
  beforeEach(() => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    const data = [
      { id: 1, name: 'Kim', score: 90, grade: 'A' },
      { id: 2, name: 'Lee', score: 80, grade: 'B' },
    ];
    cy.createGrid({ data, columns });
  });

  it('focus()', () => {
    getActiveFocusLayer().should('not.exist');

    cy.gridInstance().invoke('focus', 0, 'name');

    cy.getRow(0).should('have.class', cls('cell-current-row'));
    getActiveFocusLayer().should('exist');
  });

  it('focusAt()', () => {
    getActiveFocusLayer().should('not.exist');

    cy.gridInstance().invoke('focusAt', 0, 1);

    cy.getRow(0).should('have.class', cls('cell-current-row'));
    getActiveFocusLayer().should('exist');
  });

  it('blur()', () => {
    cy.gridInstance().invoke('focusAt', 0, 1);
    cy.gridInstance().invoke('blur');

    getActiveFocusLayer().should('not.exist');
  });

  it('activateFocus()', () => {
    cy.gridInstance().invoke('focusAt', 0, 1);
    makeInactiveFocusLayer();

    getInactiveFocusLayer().should('exist');

    cy.gridInstance().invoke('activateFocus');

    getInactiveFocusLayer().should('not.exist');
  });

  it('getFocusedCell()', () => {
    cy.gridInstance().invoke('focusAt', 0, 1);

    cy.gridInstance().invoke('getFocusedCell').should('eql', {
      rowKey: 0,
      columnName: 'name',
      value: 'Kim',
    });
  });
});

describe('scroll position following focused cell', () => {
  beforeEach(() => {
    const columns = [{ name: 'id' }];
    const data = [];
    for (let i = 0; i < 20; i += 1) {
      data.push({ id: i });
    }
    cy.createGrid({ data, columns, bodyHeight: 300 });
  });

  ['focus', 'focusAt'].forEach((api) => {
    const targetColumn = api === 'focus' ? 'id' : 0;

    it(`${api} - should move the scroll position`, () => {
      cy.gridInstance().invoke(api, 19, targetColumn);

      cy.getCell(19, 'id').should('be.visible');
      cy.getRsideBody().invoke('scrollTop').should('be.greaterThan', 0);
    });

    it(`${api} - shouldn't move the scroll position`, () => {
      cy.gridInstance().invoke(api, 19, targetColumn, false);

      cy.getCell(19, 'id').should('be.not.visible');
      cy.getRsideBody().invoke('scrollTop').should('eq', 0);
    });
  });
});

describe('should not display the focus layer', () => {
  beforeEach(() => {
    const data = [
      { name: 'Kim', age: 10 },
      { name: 'Lee', age: 20 },
      { name: 'Ryu', age: 30, _attributes: { height: 0 } },
    ];
    const columns = [
      { name: 'name', editor: 'text' },
      { name: 'age', editor: 'text' },
    ];

    cy.createGrid({ data, columns });
  });

  it('should destroy the focusing layer, when hide the column', () => {
    cy.gridInstance().invoke('focus', 1, 'name', true);
    cy.gridInstance().invoke('hideColumn', 'name');

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { columnName: null, rowKey: null, value: null });
  });

  it('cannot focus the cell on hidden cell', () => {
    cy.gridInstance().invoke('hideColumn', 'name');
    cy.gridInstance().invoke('focus', 1, 'name');

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { columnName: null, rowKey: null, value: null });
  });

  it('cannot focus the cell which has `zero` height', () => {
    cy.gridInstance().invoke('focus', 2, 'age');

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { columnName: null, rowKey: null, value: null });
  });
});
