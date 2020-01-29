import { cls } from '@/helper/dom';

function assertDisabledBodyCells(disabled: boolean) {
  cy.getBodyCells().each($el => {
    if (disabled) {
      cy.wrap($el).should('have.class', cls('cell-disabled'));
    } else {
      cy.wrap($el).should('not.have.class', cls('cell-disabled'));
    }
  });
}

before(() => {
  cy.visit('/dist');
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
  });

  it('add class by _attributes prop', () => {
    cy.getCell(0, 'name').should('have.class', 'row-test-a');
    cy.getCell(1, 'age').should('have.class', 'column-test-a');
    cy.getCell(1, 'location').should('have.class', 'column-test-b');
    cy.getCell(2, 'name').should('have.class', 'row-test-a');
  });

  it('addColumnClassName() / removeColumnClassName()', () => {
    cy.gridInstance().invoke('addColumnClassName', 'age', 'column-test-d');

    cy.getColumnCells('age').each($el => {
      cy.wrap($el).should('have.class', 'column-test-d');
    });

    cy.gridInstance().invoke('removeColumnClassName', 'age', 'column-test-d');

    cy.getColumnCells('age').each($el => {
      cy.wrap($el).should('not.have.class', 'column-test-d');
    });
  });

  it('addCellClassName() / removeCellClassName()', () => {
    cy.gridInstance().invoke('addCellClassName', 0, 'age', 'tui-grid-cell-test');

    cy.getCell(0, 'age').should('have.class', 'tui-grid-cell-test');

    cy.gridInstance().invoke('removeCellClassName', 0, 'age', 'tui-grid-cell-test');

    cy.getCell(0, 'age').should('have.not.class', 'tui-grid-cell-test');
  });

  it('addRowClassName() / removeRowClassName()', () => {
    cy.gridInstance().invoke('addRowClassName', 1, 'tui-grid-row-test');

    cy.getRow(1).each($el => {
      cy.wrap($el).should('have.class', 'tui-grid-row-test');
    });

    cy.gridInstance().invoke('removeRowClassName', 1, 'tui-grid-row-test');

    cy.getRow(1).each($el => {
      cy.wrap($el).should('not.have.class', 'tui-grid-row-test');
    });
  });
});

describe('row disabled', () => {
  beforeEach(() => {
    const data = [
      {
        name: 'Kim',
        age: 30,
        location: 'seoul',
        _attributes: { checkDisabled: true }
      },
      {
        name: 'Lee',
        age: 40,
        location: 'busan',
        _attributes: { disabled: true }
      },
      {
        name: 'Han',
        age: 28,
        location: 'Bundang',
        _attributes: { checkDisabled: false, disabled: true }
      }
    ];
    const columns = [{ name: 'name' }, { name: 'age' }, { name: 'location' }];

    cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });
  });

  it('row, checkbox disabled by attributes options', () => {
    // first row
    cy.getRow(0).each(($el, index) => {
      if (!index) {
        // checkbox
        cy.wrap($el).should('have.class', cls('cell-disabled'));
      } else {
        cy.wrap($el).should('not.have.class', cls('cell-disabled'));
      }
    });

    // second row
    cy.getRow(1).each($el => {
      cy.wrap($el).should('have.class', cls('cell-disabled'));
    });

    // third row
    cy.getRow(2).each(($el, index) => {
      if (!index) {
        // checkbox
        cy.wrap($el).should('not.have.class', cls('cell-disabled'));
      } else {
        cy.wrap($el).should('have.class', cls('cell-disabled'));
      }
    });
  });

  it('enableRow() / disableRow()', () => {
    cy.gridInstance().invoke('disableRow', 1);

    cy.getRow(1).each($el => {
      cy.wrap($el).should('have.class', cls('cell-disabled'));
    });

    cy.gridInstance().invoke('enableRow', 1, false);

    cy.getRow(1).each(($el, index) => {
      if (!index) {
        // checkbox disabled
        cy.wrap($el).should('have.class', cls('cell-disabled'));
      } else {
        cy.wrap($el).should('have.not.class', cls('cell-disabled'));
      }
    });
  });

  it('enableRowCheck() / disableRowCheck()', () => {
    cy.gridInstance().invoke('disableRowCheck', 1);

    cy.getRowHeaderCell(1).should('have.class', cls('cell-disabled'));

    cy.gridInstance().invoke('enableRowCheck', 1);

    cy.getRowHeaderCell(1).should('not.have.class', cls('cell-disabled'));
  });
});

describe('disabled precedence', () => {
  beforeEach(() => {
    const data = [
      {
        name: 'Kim',
        age: 30,
        location: 'seoul',
        _attributes: { checkDisabled: true }
      },
      {
        name: 'Lee',
        age: 40,
        location: 'busan'
      },
      {
        name: 'Han',
        age: 28,
        location: 'Bundang',
        _attributes: { checkDisabled: false, disabled: true }
      }
    ];
    const columns = [{ name: 'name' }, { name: 'age', disabled: true }, { name: 'location' }];

    cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });
  });

  it('`disabled: true` option is precedence between initial disabled options(column disabled, row disabled, grid disabled)', () => {
    cy.getRowHeaderCell(0).should('have.class', cls('cell-disabled'));
    cy.getColumnCells('age').should('have.class', cls('cell-disabled'));
    cy.getRow(2).each(($el, index) => {
      if (!index) {
        // checkbox disabled
        cy.wrap($el).should('not.have.class', cls('cell-disabled'));
      } else {
        cy.wrap($el).should('have.class', cls('cell-disabled'));
      }
    });
  });

  it('in case of applying `disabled` by API, applying order should be precedence', () => {
    cy.gridInstance().invoke('enable');

    assertDisabledBodyCells(false);

    cy.gridInstance().invoke('disableRow', 0);

    cy.getRow(0).each($el => {
      cy.wrap($el).should('have.class', cls('cell-disabled'));
    });

    cy.gridInstance().invoke('enableColumn', 'name');

    cy.getColumnCells('name').should('not.have.class', cls('cell-disabled'));
  });
});

describe('all disabled', () => {
  beforeEach(() => {
    const data = [
      {
        name: 'Kim',
        age: 30,
        location: 'seoul'
      },
      {
        name: 'Lee',
        age: 40,
        location: 'busan'
      },
      {
        name: 'Han',
        age: 28,
        location: 'Bundang'
      }
    ];
    const columns = [{ name: 'name' }, { name: 'age' }, { name: 'location' }];

    cy.createGrid({ data, columns, rowHeaders: ['checkbox'], disabled: true });
  });

  it('all disabled by data option', () => {
    assertDisabledBodyCells(true);
  });

  it('enable() / disable()', () => {
    cy.gridInstance().invoke('enable');

    assertDisabledBodyCells(false);

    cy.gridInstance().invoke('disable');

    assertDisabledBodyCells(true);
  });
});

describe('disabled + checked', () => {
  beforeEach(() => {
    const data = [
      {
        name: 'Kim',
        age: 30,
        location: 'seoul'
      },
      {
        name: 'Lee',
        age: 40,
        location: 'busan',
        _attributes: { checkDisabled: true }
      },
      {
        name: 'Han',
        age: 28,
        location: 'Bundang'
      }
    ];
    const columns = [{ name: 'name' }, { name: 'age' }, { name: 'location' }];

    cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });
  });

  it('header checkbox should be checked when all checkboxed is checked except disabled checkbox', () => {
    cy.gridInstance().invoke('check', 0);
    cy.gridInstance().invoke('check', 2);

    cy.getHeaderCell('_checked')
      .find('input')
      .should('be.checked');
  });
});
