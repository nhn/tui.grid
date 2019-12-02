before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  const columns = [{ name: 'id' }, { name: 'name' }];
  const data = [
    { id: 1, name: 'Kim', score: 90, grade: 'A' },
    { id: 2, name: 'Lee', score: 80, grade: 'B' }
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
  it('focus()', () => {
    getActiveFocusLayer().should('not.exist');

    cy.gridInstance().invoke('focus', 0, 'name');

    getActiveFocusLayer().should('exist');
  });

  it('focusAt()', () => {
    getActiveFocusLayer().should('not.exist');

    cy.gridInstance().invoke('focusAt', 0, 1);

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

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        rowKey: 0,
        columnName: 'name',
        value: 'Kim'
      });
  });
});
