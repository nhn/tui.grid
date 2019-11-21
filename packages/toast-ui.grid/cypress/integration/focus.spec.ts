before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  const columns = [{ name: 'id' }, { name: 'name' }];
  const data = [
    { id: 1, name: 'Kim', score: 90, grade: 'A' },
    { id: 2, name: 'Lee', score: 80, grade: 'B' }
  ];
  cy.createGrid({ data, columns });
});

function makeInactiveFocusLayer() {
  cy.getByCls('clipboard').focus();
  cy.getByCls('clipboard').blur();
}

describe('API', () => {
  it('focus()', () => {
    cy.getByCls('layer-focus').should('not.exist');

    cy.gridInstance().invoke('focus', 0, 'name');

    cy.getByCls('layer-focus').should('exist');
  });

  it('focusAt()', () => {
    cy.getByCls('layer-focus').should('not.exist');

    cy.gridInstance().invoke('focusAt', 0, 1);

    cy.getByCls('layer-focus').should('exist');
  });

  it('focusAt()', () => {
    cy.getByCls('layer-focus').should('not.exist');

    cy.gridInstance().invoke('focusAt', 0, 1);

    cy.getByCls('layer-focus').should('exist');
  });

  it('blur()', () => {
    cy.gridInstance().invoke('focusAt', 0, 1);
    cy.gridInstance().invoke('blur');

    cy.getByCls('layer-focus').should('not.exist');
  });

  it('activateFocus()', () => {
    cy.gridInstance().invoke('focusAt', 0, 1);
    makeInactiveFocusLayer();

    cy.getByCls('layer-focus-deactive').should('exist');

    cy.gridInstance().invoke('activateFocus');
    cy.getByCls('layer-focus-deactive').should('not.exist');
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
