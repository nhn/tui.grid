before(() => {
  cy.visit('/dist');
});

describe('frozenCount / frozenBorderWidth', () => {
  beforeEach(() => {
    const data = [
      { name: 'Kim', age: 30 },
      { name: 'Lee', age: 40 },
    ];
    const columns = [
      { header: 'name', name: 'name' },
      { header: 'age', name: 'age' },
    ];
    cy.createGrid({
      data,
      columns,
      columnOptions: {
        frozenCount: 1,
        frozenBorderWidth: 3,
      },
    });
  });

  it('frozen border is rendered properly', () => {
    cy.getByCls('frozen-border').should('exist');
    cy.getByCls('frozen-border').invoke('width').should('eq', 3);
  });
});

describe('minWidth', () => {
  beforeEach(() => {
    const data = [
      { name: 'Kim', age: 30 },
      { name: 'Lee', age: 40 },
    ];
    const columns = [
      { header: 'name', name: 'name' },
      { header: 'age', name: 'age' },
    ];
    cy.createGrid({
      data,
      columns,
      columnOptions: {
        minWidth: 500,
      },
    });
  });

  it('width of columns can be fixed through configuring minWidth of columnOptions', () => {
    cy.getColumnCells('name').each(($el) => {
      expect($el.width()).eq(500);
    });
    cy.getColumnCells('age').each(($el) => {
      expect($el.width()).eq(500);
    });
  });
});
