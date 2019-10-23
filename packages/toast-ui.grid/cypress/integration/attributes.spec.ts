import { cls } from '@/helper/dom';
import { OptRow } from '@/types';

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
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

describe('row, checkbox disable', () => {
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
  ] as OptRow[];
  const columns = [{ name: 'name' }, { name: 'age' }, { name: 'location' }];

  it('row disable, checkbox disable by attributes options', () => {
    data[0]._attributes = { checkDisabled: true };
    data[1]._attributes = { disabled: true };
    data[2]._attributes = {
      checkDisabled: false,
      disabled: true
    };

    cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });

    cy.get(`.${cls('cell-row-header')}`)
      .eq(1)
      .should('have.class', cls('cell-disabled'));

    cy.getCell(0, 'name').should('not.have.class', cls('cell-disabled'));

    cy.get(`.${cls('cell-row-header')}`)
      .eq(2)
      .should('have.class', cls('cell-disabled'));

    cy.getCell(1, 'name').should('have.class', cls('cell-disabled'));

    cy.get(`.${cls('cell-row-header')}`)
      .eq(3)
      .should('not.have.class', cls('cell-disabled'));

    cy.getCell(2, 'name').should('have.class', cls('cell-disabled'));
  });

  it('enable, disable api', () => {
    cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });

    cy.gridInstance().invoke('disable');

    cy.get(`.${cls('table')} tr .${cls('cell-row-header')} input`).should($el => {
      $el.each((_, input) => {
        const inputWithType = input as HTMLInputElement;
        expect(inputWithType.disabled).to.be.true;
      });
    });

    cy.get(`td.${cls('cell')}`).should($el => {
      $el.each((_, elem) => {
        expect(elem.classList.contains(`${cls('cell-disabled')}`)).to.be.true;
      });
    });

    cy.gridInstance().invoke('enable');

    cy.get(`.${cls('table')} tr .${cls('cell-row-header')} input`).should($el => {
      $el.each((_, input) => {
        const inputWithType = input as HTMLInputElement;
        expect(inputWithType.disabled).to.be.false;
      });
    });

    cy.get(`td.${cls('cell')}`).should($el => {
      $el.each((_, elem) => {
        expect(elem.classList.contains(`${cls('cell-disabled')}`)).to.be.false;
      });
    });
  });

  it('enableRow, disableRow api', () => {
    cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });
    cy.gridInstance().invoke('disableRow', 1);

    cy.get(`[data-row-key=1]`).should($el => {
      $el.each((_, elem) => {
        expect(elem.classList.contains(`${cls('cell-disabled')}`)).to.be.true;
      });
    });

    cy.gridInstance().invoke('enableRow', 1, false);
    cy.get(`[data-row-key=1]`).should($el => {
      $el.each((index, elem) => {
        if (!index) {
          // checkbox disabled
          expect(elem.classList.contains(`${cls('cell-disabled')}`)).to.be.true;
        } else {
          expect(elem.classList.contains(`${cls('cell-disabled')}`)).to.be.false;
        }
      });
    });
  });

  it('enableRowCheck, disableRowCheck api', () => {
    cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });
    cy.gridInstance().invoke('disableRow', 1);
    cy.get(`[data-row-key=1]`)
      .eq(0)
      .should('have.class', cls('cell-disabled'));

    cy.gridInstance().invoke('enableRowCheck', 1);
    cy.get(`[data-row-key=1]`)
      .eq(0)
      .should('not.have.class', cls('cell-disabled'));
  });
});
