import { cls } from '../../src/helper/dom';
import Grid from '../../src/grid';
import { OptGrid, OptRow } from '@/types';
import { RowKey } from '@/store/types';
import { Omit } from 'utility-types';

const columns = [{ name: 'c1' }, { name: 'c2' }];

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

function assertToggleButtonExpanded(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.get(`.${cls('tree-extra-content')}`).should('have.class', cls('tree-button-expand'));
  });
}

function assertToggleButtonCollapsed(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.get(`.${cls('tree-extra-content')}`).should('have.class', cls('tree-button-collapse'));
  });
}

function createGrid(options: Omit<OptGrid, 'el'>) {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });

  cy.createGrid({ ...options });
}

before(() => {
  cy.visit('/dist');
});

let data: OptRow[];

beforeEach(() => {
  data = [
    {
      c1: 'foo',
      _children: [
        {
          c1: 'bar',
          _attributes: {
            expanded: true
          },
          _children: [
            {
              c1: 'baz',
              _attributes: {
                expanded: false
              },
              _children: [
                {
                  c1: 'qux'
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  createGrid({
    data,
    columns,
    treeColumnOptions: {
      name: 'c1'
    }
  });
});

describe('options', () => {
  it('create tree column.', () => {
    cy.getCell(0, 'c1').should('have.class', cls('cell-has-tree'));
    cy.getCell(1, 'c1').should('have.class', cls('cell-has-tree'));
    cy.getCell(2, 'c1').should('have.class', cls('cell-has-tree'));
  });

  context('useIcon option', () => {
    it('create icon on cell by default.', () => {
      cy.getCell(1, 'c1').within(() => {
        cy.get(`.${cls('tree-icon')}`)
          .its('length')
          .should('be.eql', 1);
      });
    });

    it('set false then icon is not created.', () => {
      createGrid({
        data,
        columns,
        treeColumnOptions: {
          name: 'c1',
          useIcon: false
        }
      });

      cy.getCell(1, 'c1').within(() => {
        cy.get(`.${cls('tree-icon')}`).should('not.exist');
      });
    });
  });

  context('useCascading', () => {
    function assertCheckedRow(rowKey: RowKey, checked: boolean) {
      cy.getCell(rowKey, '_checked').within(() => {
        cy.get('[type="checkbox"]').should(checked ? 'be.checked' : 'not.be.checked');
      });
    }

    it ('set true or by default then row is checked recursively by parent or child row is checked.', () => {
      createGrid({
        data,
        columns,
        rowHeaders: ['_checked'],
        treeColumnOptions: {
          name: 'c1',
          useCascadingCheckbox: true
        }
      });
      
      assertCheckedRow(0, false);
      assertCheckedRow(1, false);
      assertCheckedRow(2, false);
      assertCheckedRow(3, false);

      cy.gridInstance().invoke('check', 2);

      assertCheckedRow(0, true);
      assertCheckedRow(1, true);
      assertCheckedRow(2, true);
      assertCheckedRow(3, true);

      cy.gridInstance().invoke('uncheck', 2);

      assertCheckedRow(0, false);
      assertCheckedRow(1, false);
      assertCheckedRow(2, false);
      assertCheckedRow(3, false);
    });

    it('set false then check only each row.', () => {
      createGrid({
        data,
        columns,
        rowHeaders: ['_checked'],
        treeColumnOptions: {
          name: 'c1',
          useCascadingCheckbox: false
        }
      });

      assertCheckedRow(0, false);
      assertCheckedRow(1, false);
      assertCheckedRow(2, false);
      assertCheckedRow(3, false);

      cy.gridInstance().invoke('check', 2);

      assertCheckedRow(0, false);
      assertCheckedRow(1, false);
      assertCheckedRow(2, true);
      assertCheckedRow(3, false);
    })
  });
});

describe('toggle button', () => {
  it(`is created when row data has '_children' property.`, () => {
    cy.getCell(0, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`)
        .its('length')
        .should('be.eql', 1);
    });
    cy.getCell(1, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`)
        .its('length')
        .should('be.eql', 1);
    });
    cy.getCell(2, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`)
        .its('length')
        .should('be.eql', 1);
    });
    cy.getCell(3, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`).should('not.exist');
    });
  });

  context(`set 'expanded' attribute to`, () => {
    it(`true or by default then toggle button collpased.`, () => {
      assertToggleButtonExpanded(0, 'c1');
      assertToggleButtonExpanded(1, 'c1');
    });

    it(`false then toggle button collapsed.`, () => {
      assertToggleButtonCollapsed(2, 'c1');
    });
  });

  context('change state by clicking button', () => {
    it('from expanded to collapse.', () => {
      cy.getCell(1, 'c1').within(() => {
        cy.get(`.${cls('btn-tree')}`).click();
      });
      assertToggleButtonCollapsed(1, 'c1');
    });

    it('from collpased to expanded.', () => {
      cy.getCell(2, 'c1').within(() => {
        cy.get(`.${cls('btn-tree')}`).click();
      });
      assertToggleButtonExpanded(2, 'c1');
    });
  });

  context('change state by api', () => {
    it('from expanded to collapse.', () => {
      cy.gridInstance().invoke('collapse', 1);
      assertToggleButtonCollapsed(1, 'c1');
    });

    it('from collpased to expanded.', () => {
      cy.gridInstance().invoke('expand', 2);
      assertToggleButtonExpanded(2, 'c1');
    });
  });
});

describe('ccollapse', () => {
  context('collapse()', () => {
    it('hide child rows.', () => {
      cy.getCell(1, 'c1').should('be.visible');
      cy.getCell(2, 'c1').should('be.visible');

      cy.gridInstance().invoke('collapse', 0);

      cy.getCell(1, 'c1').should('not.be.visible');
      cy.getCell(2, 'c1').should('not.be.visible');
    });

    it('do not collapse expanded internal child rows recursively.', () => {
      assertToggleButtonExpanded(0, 'c1');
      assertToggleButtonExpanded(1, 'c1');

      cy.gridInstance().invoke('collapse', 0);
      cy.gridInstance().invoke('expand', 0);

      assertToggleButtonExpanded(0, 'c1');
      assertToggleButtonExpanded(1, 'c1');
    });

    it('collapse expanded internal child rows recursively.', () => {
      assertToggleButtonExpanded(0, 'c1');
      assertToggleButtonExpanded(1, 'c1');

      cy.gridInstance().invoke('collapse', 0, true);
      cy.gridInstance().invoke('expand', 0);

      assertToggleButtonExpanded(0, 'c1');
      assertToggleButtonCollapsed(1, 'c1');
    });
  });

  it('collapseAll() hide decendent rows.', () => {
    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');

    cy.gridInstance().invoke('collapseAll');
    cy.gridInstance().invoke('expand', 0);

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');
  });
});

describe('expand', () => {
  context('expand()', () => {
    it('show child rows.', () => {
      cy.getCell(3, 'c1').should('not.be.visible');

      cy.gridInstance().invoke('expand', 2);

      cy.getCell(3, 'c1').should('be.visible');
    });

    it('do not expand collapsed internal child rows recursively.', () => {
      cy.gridInstance().invoke('collapse', 1);
      cy.gridInstance().invoke('collapse', 2);

      assertToggleButtonCollapsed(1, 'c1');
      assertToggleButtonCollapsed(2, 'c1');

      cy.gridInstance().invoke('expand', 0);
      cy.gridInstance().invoke('collapse', 0);

      assertToggleButtonCollapsed(1, 'c1');
      assertToggleButtonCollapsed(2, 'c1');
    });

    it('expand collapsed internal child rows recursively.', () => {
      cy.gridInstance().invoke('collapse', 1);
      cy.gridInstance().invoke('collapse', 2);

      assertToggleButtonCollapsed(1, 'c1');
      assertToggleButtonCollapsed(2, 'c1');

      cy.gridInstance().invoke('expand', 0, true);
      cy.gridInstance().invoke('collapse', 0);

      assertToggleButtonExpanded(1, 'c1');
      assertToggleButtonExpanded(2, 'c1');
    });
  });

  it('expandAll() show decendent rows.', () => {
    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');

    cy.gridInstance().invoke('collapse', 0);
    cy.gridInstance().invoke('expandAll');

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('be.visible');
  });
});
