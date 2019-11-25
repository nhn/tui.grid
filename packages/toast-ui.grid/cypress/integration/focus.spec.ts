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

function getFocusLayer(inactive = false) {
  return cy.getByCls(inactive ? 'layer-focus-deactive' : 'layer-focus');
}

function makeInactiveFocusLayer() {
  cy.getByCls('clipboard').focus();
  cy.getByCls('clipboard').blur();
}

describe('API', () => {
  it('focus()', () => {
    getFocusLayer().should('not.exist');

    cy.gridInstance().invoke('focus', 0, 'name');

    getFocusLayer().should('exist');
  });

  it('focusAt()', () => {
    getFocusLayer().should('not.exist');

    cy.gridInstance().invoke('focusAt', 0, 1);

    getFocusLayer().should('exist');
  });

  it('blur()', () => {
    cy.gridInstance().invoke('focusAt', 0, 1);
    cy.gridInstance().invoke('blur');

    getFocusLayer().should('not.exist');
  });

  it('activateFocus()', () => {
    cy.gridInstance().invoke('focusAt', 0, 1);
    makeInactiveFocusLayer();

    getFocusLayer(false).should('exist');

    cy.gridInstance().invoke('activateFocus');
    getFocusLayer(false).should('not.exist');
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
