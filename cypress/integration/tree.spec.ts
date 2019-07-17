import { cls } from '../../src/helper/dom';
import { OptGrid, OptRow } from '@/types';
import { Row, RowKey } from '@/store/types';
import { Omit } from 'utility-types';

const columns = [{ name: 'c1' }, { name: 'c2' }];

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

describe('treeColumnOptions', () => {
  context('name', () => {
    it('create tree column.', () => {
      createGrid({
        data,
        columns,
        treeColumnOptions: {
          name: 'c2'
        }
      });

      cy.gridInstance().invoke('expand', 0, true);
      cy.getCell(0, 'c2').should('have.class', cls('cell-has-tree'));
      cy.getCell(1, 'c2').should('have.class', cls('cell-has-tree'));
      cy.getCell(2, 'c2').should('have.class', cls('cell-has-tree'));
    });
  });

  context('useIcon', () => {
    it('create icon on cell by default.', () => {
      cy.getCell(0, 'c1').within(() => {
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

      cy.getCell(0, 'c1').within(() => {
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

    it('set true or by default then row is checked recursively by parent or child row is checked.', () => {
      createGrid({
        data,
        columns,
        rowHeaders: ['checkbox'],
        treeColumnOptions: {
          name: 'c1',
          useCascadingCheckbox: true
        }
      });

      cy.gridInstance().invoke('check', 2);
      cy.gridInstance().invoke('expand', 0, true);

      assertCheckedRow(1, true);
      assertCheckedRow(2, true);
      assertCheckedRow(3, true);

      cy.gridInstance().invoke('uncheck', 2);

      assertCheckedRow(1, false);
      assertCheckedRow(2, false);
      assertCheckedRow(3, false);
    });

    it('set false then check only each row.', () => {
      createGrid({
        data,
        columns,
        rowHeaders: ['checkbox'],
        treeColumnOptions: {
          name: 'c1',
          useCascadingCheckbox: false
        }
      });

      cy.gridInstance().invoke('check', 2);
      cy.gridInstance().invoke('expand', 0, true);

      assertCheckedRow(0, false);
      assertCheckedRow(1, false);
      assertCheckedRow(2, true);
      assertCheckedRow(3, false);

      cy.gridInstance().invoke('check', 0);

      assertCheckedRow(0, true);
      assertCheckedRow(1, false);
      assertCheckedRow(2, true);
      assertCheckedRow(3, false);
    });
  });
});

describe('toggle button', () => {
  it(`is created when row data has children.`, () => {
    cy.gridInstance().invoke('expand', 0, true);
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
      cy.gridInstance().invoke('expand', 0);
      assertToggleButtonExpanded(0, 'c1');
      assertToggleButtonExpanded(1, 'c1');
    });

    it(`false then toggle button collapsed.`, () => {
      cy.gridInstance().invoke('expand', 0);
      assertToggleButtonCollapsed(2, 'c1');
    });
  });

  context('change state by clicking.', () => {
    it('from expanded to collapse.', () => {
      cy.gridInstance().invoke('expand', 0);
      cy.getCell(1, 'c1').within(() => {
        cy.get(`.${cls('btn-tree')}`).click();
      });
      assertToggleButtonCollapsed(1, 'c1');
    });

    it('from collpased to expanded.', () => {
      cy.getCell(0, 'c1').within(() => {
        cy.get(`.${cls('btn-tree')}`).click();
      });
      assertToggleButtonExpanded(0, 'c1');
    });
  });

  context('change state by api', () => {
    it('from expanded to collapse.', () => {
      cy.gridInstance().invoke('expand', 0);
      cy.gridInstance().invoke('collapse', 1);
      assertToggleButtonCollapsed(1, 'c1');
    });

    it('from collpased to expanded.', () => {
      cy.gridInstance().invoke('expand', 0);
      assertToggleButtonExpanded(0, 'c1');
    });
  });
});

describe('collapse()', () => {
  it('hide child rows.', () => {
    cy.gridInstance().invoke('expand', 0);
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');

    cy.gridInstance().invoke('collapse', 0);

    cy.getCell(1, 'c1').should('not.be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
  });

  it('collapse expanded internal child rows recursively.', () => {
    cy.gridInstance().invoke('collapse', 0, true);
    cy.gridInstance().invoke('expand', 0);

    assertToggleButtonExpanded(0, 'c1');
    assertToggleButtonCollapsed(1, 'c1');
  });
});

describe('collapseAll()', () => {
  it('hide decendent rows.', () => {
    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('not.be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');

    cy.gridInstance().invoke('collapseAll');
    cy.gridInstance().invoke('expand', 0);

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');
  });
});

describe('expand()', () => {
  it('show child rows.', () => {
    cy.gridInstance().invoke('expand', 0);
    cy.gridInstance().invoke('expand', 2);

    cy.getCell(3, 'c1').should('be.visible');
  });

  it('do not expand collapsed internal child rows recursively.', () => {
    cy.gridInstance().invoke('collapse', 1);
    cy.gridInstance().invoke('collapse', 2);

    cy.gridInstance().invoke('expand', 0);
    assertToggleButtonCollapsed(1, 'c1');

    cy.gridInstance().invoke('expand', 1);
    assertToggleButtonCollapsed(2, 'c1');
  });

  it('expand collapsed internal child rows recursively.', () => {
    cy.gridInstance().invoke('collapse', 1);
    cy.gridInstance().invoke('collapse', 2);

    cy.gridInstance().invoke('expand', 0, true);

    assertToggleButtonExpanded(1, 'c1');
    assertToggleButtonExpanded(2, 'c1');
  });
});

describe('expandAll()', () => {
  it(' show decendent rows.', () => {
    cy.gridInstance().invoke('collapse', 0);
    cy.gridInstance().invoke('expandAll');

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('be.visible');
  });
});

describe('appendRow()', () => {
  context('leaf row append at', () => {
    const appendedData = { c1: 'test' };

    it('root.', () => {
      cy.gridInstance().invoke('appendRow', appendedData);
      cy.gridInstance().invoke('expandAll');

      cy.getCell(4, 'c1').should('be.visible');
      cy.getCell(4, 'c1').should('have.text', 'test');
    });

    it('specific parent.', () => {
      cy.gridInstance().invoke('appendRow', appendedData, { parentRowKey: 0 });
      cy.gridInstance().invoke('expandAll');

      cy.getCell(4, 'c1').should('be.visible');
      cy.getCell(4, 'c1').should('have.text', 'test');

      cy.gridInstance().invoke('collapse', 0);
      cy.getCell(4, 'c1').should('be.not.visible');
    });
  });

  context('internal row append to', () => {
    const appendedData = {
      c1: 'a',
      _children: [{ c1: 'b' }, { c1: 'c' }]
    };

    it('root.', () => {
      cy.gridInstance().invoke('appendRow', appendedData);
      cy.gridInstance().invoke('expandAll');

      cy.getCell(4, 'c1').should('be.visible');
      cy.getCell(5, 'c1').should('be.visible');
      cy.getCell(6, 'c1').should('be.visible');
      cy.getCell(4, 'c1').should('have.text', 'a');
      cy.getCell(5, 'c1').should('have.text', 'b');
      cy.getCell(6, 'c1').should('have.text', 'c');
    });

    it('specific parent that internal type.', () => {
      cy.gridInstance().invoke('appendRow', appendedData, { parentRowKey: 0 });
      cy.gridInstance().invoke('expand', 0, true);

      cy.getCell(4, 'c1').should('be.visible');
      cy.getCell(5, 'c1').should('be.visible');
      cy.getCell(6, 'c1').should('be.visible');
      cy.getCell(4, 'c1').should('have.text', 'a');
      cy.getCell(5, 'c1').should('have.text', 'b');
      cy.getCell(6, 'c1').should('have.text', 'c');

      cy.gridInstance().invoke('collapse', 0);
      cy.getCell(4, 'c1').should('be.not.visible');
      cy.getCell(5, 'c1').should('be.not.visible');
      cy.getCell(6, 'c1').should('be.not.visible');
    });

    it('specific parent that collapsed.', () => {
      cy.gridInstance().invoke('appendRow', appendedData, { parentRowKey: 2 });
      cy.gridInstance().invoke('expand', 0);
      cy.gridInstance().invoke('expand', 2);

      cy.getCell(4, 'c1').should('have.text', 'a');
      cy.getCell(4, 'c1').should('be.visible');
      cy.getCell(5, 'c1').should('be.not.visible');
      cy.getCell(6, 'c1').should('be.not.visible');
    });
  });
});

describe('removeRow()', () => {
  function assertInternalRow(rowKey: RowKey) {
    cy.getCell(rowKey, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`)
        .its('length')
        .should('be.eql', 1);
    });
  }

  function assertLeafRow(rowKey: RowKey) {
    cy.getCell(rowKey, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`).should('not.exist');
    });
  }

  it('leaf row is removed.', () => {
    cy.gridInstance().invoke('expand', 0, true);

    cy.getCell(3, 'c1')
      .its('length')
      .should('be.eql', 1);
    cy.gridInstance().invoke('removeRow', 3);
    cy.getCell(3, 'c1').should('not.exist');
  });

  context('internal row', () => {
    it('is removed.', () => {
      cy.gridInstance().invoke('expand', 0, true);

      cy.getCell(2, 'c1')
        .its('length')
        .should('be.eql', 1);
      cy.gridInstance().invoke('removeRow', 2);
      cy.getCell(2, 'c1').should('not.exist');
    });

    it('is removed then descendant rows are removed.', () => {
      cy.gridInstance().invoke('expand', 0, true);

      cy.gridInstance()
        .invoke('getDescendantRows', 2)
        .then((rows) => {
          rows.forEach(({ rowKey }: Row) => {
            cy.getCell(rowKey, 'c1')
              .its('length')
              .should('be.eql', 1);
          });
        });

      cy.gridInstance().invoke('removeRow', 1);

      cy.gridInstance()
        .invoke('getDescendantRows', 2)
        .then((rows) => {
          rows.forEach(({ rowKey }: Row) => {
            cy.getCell(rowKey, 'c1').should('not.exist');
          });
        });
    });
  });

  context('parent row', () => {
    it('that has only one child is changed to leaf row.', () => {
      cy.gridInstance().invoke('expand', 0, true);

      assertInternalRow(2);
      cy.gridInstance().invoke('removeRow', 3);
      assertLeafRow(2);
    });

    it('that has children is not changed to leaf row.', () => {
      cy.gridInstance().invoke('expand', 0, true);

      assertInternalRow(1);
      cy.gridInstance().invoke('removeRow', 3);
      assertInternalRow(1);
    });
  });
});

it('attach tree rows only expanded to DOM element.', () => {
  cy.get(`.${cls('rside-area')} .${cls('body-area')} tr`).should('have.length', 1);

  cy.gridInstance().invoke('expand', 0);
  cy.get(`.${cls('rside-area')} .${cls('body-area')} tr`).should('have.length', 3);

  cy.gridInstance().invoke('expand', 2);
  cy.get(`.${cls('rside-area')} .${cls('body-area')} tr`).should('have.length', 4);
});
