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

function getGridInst(): Cypress.Chainable<Grid> {
  return (cy.window() as Cypress.Chainable<Window & GridGlobal>).its('grid');
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

describe('options', () => {
  let data: OptRow[];

  beforeEach(() => {
    data = [
      {
        c1: 'foo',
        c2: 'foo'
      },
      {
        c1: 'bar',
        c2: 'bar',
        _attribute: {
          expanded: true
        },
        _children: [
          {
            c1: 'baz',
            c2: 'baz'
          },
          {
            c1: 'qux',
            c2: 'qux'
          }
        ]
      }
    ];

    createGrid({
      data,
      columns,
      treeColumnOptions: {
        name: 'c2'
      }
    });
  });

  it('create tree column.', () => {
    cy.getCell(0, 'c2').should('have.class', cls('cell-has-tree'));
    cy.getCell(1, 'c2').should('have.class', cls('cell-has-tree'));
    cy.getCell(2, 'c2').should('have.class', cls('cell-has-tree'));
  });

  context('useIcon option', () => {
    it('create icon on cell by default.', () => {
      // eslint-disable-next-line max-nested-callbacks
      cy.getCell(1, 'c2').within(() => {
        cy.get(`.${cls('tree-icon')}`)
          .its('length')
          .should('be.eql', 1);
      });
    });

    it('set false then icon is not created.', () => {
      // eslint-disable-next-line max-nested-callbacks
      cy.document().then((doc) => {
        doc.body.innerHTML = '';
      });
      cy.createGrid({
        data,
        columns,
        treeColumnOptions: {
          name: 'c1',
          useIcon: false
        }
      });

      // eslint-disable-next-line max-nested-callbacks
      cy.getCell(1, 'c1').within(() => {
        cy.get(`.${cls('tree-icon')}`).should('not.exist');
      });
    });
  });
});

describe('toggle button', () => {
  beforeEach(() => {
    const data = [
      {
        c1: 'foo',
        _children: [
          {
            c1: 'bar',
            _attributes: {
              expanded: false
            },
            _children: [
              {
                c1: 'baz'
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

  it(`is created when row data has '_children' property.`, () => {
    cy.getCell(1, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`)
        .its('length')
        .should('be.eql', 1);
    });
  });

  context(`set 'expanded' attribute to`, () => {
    it(`true or by default then toggle button expanded.`, () => {
      assertToggleButtonExpanded(0, 'c1');
    });

    it(`false then toggle button collapsed.`, () => {
      assertToggleButtonCollapsed(1, 'c1');
    });
  });

  context('change state by clicking button', () => {
    it('from expanded to collapse.', () => {
      // eslint-disable-next-line max-nested-callbacks
      cy.getCell(1, 'c1').within(() => {
        cy.get(`.${cls('btn-tree')}`).click();
      });

      assertToggleButtonExpanded(1, 'c1');
    });

    it('from collpased to expanded.', () => {
      // eslint-disable-next-line max-nested-callbacks
      cy.getCell(1, 'c1').within(() => {
        cy.get(`.${cls('btn-tree')}`).click();
        cy.get(`.${cls('btn-tree')}`).click();
      });

      assertToggleButtonCollapsed(1, 'c1');
    });
  });

  context('change state by api', () => {
    it('from expanded to collapse.', () => {
      getGridInst().invoke('collapse', 0);
      assertToggleButtonCollapsed(0, 'c1');
    });

    it('from collpased to expanded.', () => {
      getGridInst().invoke('collapse', 0);
      getGridInst().invoke('expand', 0);
      assertToggleButtonExpanded(0, 'c1');
    });
  });
});

describe('API', () => {
  let data: OptRow[];

  beforeEach(() => {
    data = [
      {
        c1: 'foo',
        _children: [
          {
            c1: 'bar',
            _children: [
              {
                c1: 'baz',
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

  context('collapse()', () => {
    it('hide child rows.', () => {
      cy.getCell(2, 'c1').should('be.visible');
      cy.getCell(3, 'c1').should('be.visible');

      getGridInst().invoke('collapse', 1);

      cy.getCell(2, 'c1').should('not.be.visible');
      cy.getCell(3, 'c1').should('not.be.visible');
    });

    it('do not collapse expanded internal child rows recursively.', () => {
      assertToggleButtonExpanded(1, 'c1');
      assertToggleButtonExpanded(2, 'c1');

      getGridInst().invoke('collapse', 0);
      getGridInst().invoke('expand', 0);

      assertToggleButtonExpanded(1, 'c1');
      assertToggleButtonExpanded(2, 'c1');
    });

    it('collapse expanded internal child rows recursively.', () => {
      assertToggleButtonExpanded(1, 'c1');
      assertToggleButtonExpanded(2, 'c1');

      getGridInst().invoke('collapse', 0, true);
      getGridInst().invoke('expand', 0);

      assertToggleButtonCollapsed(1, 'c1');
      assertToggleButtonCollapsed(2, 'c1');
    });
  });

  context('expand()', () => {
    it('show child rows.', () => {
      getGridInst().invoke('collapse', 1);

      cy.getCell(2, 'c1').should('not.be.visible');
      cy.getCell(3, 'c1').should('not.be.visible');

      getGridInst().invoke('expand', 1);

      cy.getCell(2, 'c1').should('be.visible');
      cy.getCell(3, 'c1').should('be.visible');
    });

    it('do not expand collapsed internal child rows recursively.', () => {
      getGridInst().invoke('collapse', 1);
      getGridInst().invoke('collapse', 2);

      assertToggleButtonCollapsed(1, 'c1');
      assertToggleButtonCollapsed(2, 'c1');

      getGridInst().invoke('expand', 0);
      getGridInst().invoke('collapse', 0);

      assertToggleButtonCollapsed(1, 'c1');
      assertToggleButtonCollapsed(2, 'c1');
    });

    it('expand collapsed internal child rows recursively.', () => {
      getGridInst().invoke('collapse', 1);
      getGridInst().invoke('collapse', 2);

      assertToggleButtonCollapsed(1, 'c1');
      assertToggleButtonCollapsed(2, 'c1');

      getGridInst().invoke('expand', 0, true);
      getGridInst().invoke('collapse', 0);

      assertToggleButtonExpanded(1, 'c1');
      assertToggleButtonExpanded(2, 'c1');
    });
  });

  it('collapseAll() hide decendent rows.', () => {
    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('be.visible');

    getGridInst().invoke('collapseAll');

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('not.be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');
  });

  it('expandAll() show decendent rows.', () => {
    getGridInst().invoke('collapseAll');

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('not.be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');

    getGridInst().invoke('expandAll');

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('be.visible');
  });
});
