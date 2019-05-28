before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

describe('className', () => {
  beforeEach(() => {
    const data = [
      {
        name: 'Kim',
        age: 30,
        location: 'seoul',
        _attributes: { className: { row: ['row-test-a'] } }
      },
      {
        name: 'Lee',
        age: 40,
        location: 'busan',
        _attributes: {
          className: {
            column: { age: ['column-test-a'], location: ['column-test-b'] }
          }
        }
      },
      {
        name: 'Han',
        age: 28,
        location: 'Bundang',
        _attributes: {
          className: {
            row: ['row-test-a'],
            column: { name: ['column-test-a'], location: ['column-test-b'] }
          }
        }
      }
    ];
    const columns = [{ name: 'name' }, { name: 'age' }, { name: 'location' }];

    cy.createGrid({ data, columns });
    cy.createStyle(`
      .row-test-a {
        color: rgb(255, 255, 0);
      }
      .column-test-a {
        color: rgb(135, 206, 235);
      }
      .column-test-b {
        color: green;
      }
      .tui-grid-cell-test {
        color: blue;
        background-color: #ff6666;
      }
      .tui-grid-row-test {
        color: red;
        background-color: #666666;
      }
    `);
  });

  it('add class by _attributes prop', () => {
    cy.getCell(0, 'name').should('have.class', 'row-test-a');
    cy.getCell(1, 'age').should('have.class', 'column-test-a');
    cy.getCell(1, 'location').should('have.class', 'column-test-b');
    cy.getCell(2, 'name').should('have.class', 'row-test-a');
  });

  it('add and remove class by api', () => {
    cy.gridInstance().invoke('addCellClassName', 0, 'age', 'tui-grid-cell-test');
    cy.getCell(0, 'age').should('have.class', 'tui-grid-cell-test');
    cy.gridInstance().invoke('removeCellClassName', 0, 'age', 'tui-grid-cell-test');
    cy.getCell(0, 'age').should('have.not.class', 'tui-grid-cell-test');
    cy.gridInstance().invoke('addRowClassName', 1, 'tui-grid-row-test');
    cy.getCell(1, 'age').should('have.class', 'tui-grid-row-test');
    cy.getCell(1, 'location').should('have.class', 'tui-grid-row-test');
    cy.getCell(1, 'name').should('have.class', 'tui-grid-row-test');
    cy.gridInstance().invoke('removeRowClassName', 1, 'tui-grid-row-test');
    cy.getCell(1, 'age').should('have.not.class', 'tui-grid-row-test');
    cy.getCell(1, 'location').should('have.not.class', 'tui-grid-row-test');
    cy.getCell(1, 'name').should('have.not.class', 'tui-grid-row-test');
  });
});
