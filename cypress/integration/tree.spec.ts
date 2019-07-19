import { cls } from '../../src/helper/dom';
import { OptGrid, OptRow } from '@/types';
import { Row, RowKey } from '@/store/types';
import { Omit } from 'utility-types';

type ModifiedType = 'createdRows' | 'updatedRows' | 'deletedRows';

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

function assertModifiedRowsLength(type: ModifiedType, length: number) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .its(type)
    .should('have.length', length);
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
                },
                {
                  c1: 'quxx',
                  _children: []
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
    it('creates tree column.', () => {
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
    it('creates icon on cell by default.', () => {
      cy.getCell(0, 'c1').within(() => {
        cy.get(`.${cls('tree-icon')}`)
          .its('length')
          .should('be.eql', 1);
      });
    });

    it('sets to false then icon is not created.', () => {
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

    it('sets to true or by default then row is checked recursively by parent or child row is checked.', () => {
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

    it('sets to false then check only each row.', () => {
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
  it(`is created when row data has '_children' property.`, () => {
    cy.gridInstance().invoke('expand', 0, true);
    cy.getCell(2, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`)
        .its('length')
        .should('be.eql', 1);
    });
    cy.getCell(3, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`).should('not.exist');
    });
    cy.getCell(4, 'c1').within(() => {
      cy.get(`.${cls('btn-tree')}`)
        .its('length')
        .should('be.eql', 1);
    });
  });

  context(`sets 'expanded' attribute to`, () => {
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

  context('changes state by clicking.', () => {
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

  context('changes state by api', () => {
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
  it('hides child rows.', () => {
    cy.gridInstance().invoke('expand', 0);
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');

    cy.gridInstance().invoke('collapse', 0);

    cy.getCell(1, 'c1').should('not.be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
  });

  it('collapses expanded internal child rows recursively.', () => {
    cy.gridInstance().invoke('collapse', 0, true);
    cy.gridInstance().invoke('expand', 0);

    assertToggleButtonExpanded(0, 'c1');
    assertToggleButtonCollapsed(1, 'c1');
  });
});

describe('collapseAll()', () => {
  it('hides decendent rows.', () => {
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
  it('shows child rows.', () => {
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

  it('expands collapsed internal child rows recursively.', () => {
    cy.gridInstance().invoke('collapse', 1);
    cy.gridInstance().invoke('collapse', 2);

    cy.gridInstance().invoke('expand', 0, true);

    assertToggleButtonExpanded(1, 'c1');
    assertToggleButtonExpanded(2, 'c1');
  });
});

describe('expandAll()', () => {
  it('shows decendent rows.', () => {
    cy.gridInstance().invoke('collapse', 0);
    cy.gridInstance().invoke('expandAll');

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('be.visible');
  });
});

describe('appendRow()', () => {
  it('appends leaf row on root.', () => {
    const appendedData = { c1: 'test' };

    cy.gridInstance().invoke('appendRow', appendedData);
    cy.gridInstance().invoke('expandAll');

    cy.getCell(5, 'c1').should('be.visible');
    cy.getCell(5, 'c1').should('have.text', 'test');
  });

  it('appends internal row on root.', () => {
    const appendedData = {
      c1: 'a',
      _children: [{ c1: 'b' }, { c1: 'c' }]
    };

    cy.gridInstance().invoke('appendRow', appendedData);
    cy.gridInstance().invoke('expandAll');

    cy.getCell(4, 'c1').should('be.visible');
    cy.getCell(5, 'c1').should('be.visible');
    cy.getCell(6, 'c1').should('be.visible');
    cy.getCell(4, 'c1').should('have.text', 'a');
    cy.getCell(5, 'c1').should('have.text', 'b');
    cy.getCell(6, 'c1').should('have.text', 'c');
  });
});

describe('appendTreeRow()', () => {
  it('appends leaf row to specific parent.', () => {
    const appendedData = { c1: 'test' };

    cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });
    cy.gridInstance().invoke('expandAll');

    cy.getCell(4, 'c1').should('be.visible');
    cy.getCell(4, 'c1').should('have.text', 'test');

    cy.gridInstance().invoke('collapse', 0);
    cy.getCell(4, 'c1').should('be.not.visible');
  });

  context('appends internal row to', () => {
    const appendedData = {
      c1: 'a',
      _children: [{ c1: 'b' }, { c1: 'c' }]
    };

    it('root.', () => {
      cy.gridInstance().invoke('appendRow', appendedData);
      cy.gridInstance().invoke('expandAll');

      cy.getCell(5, 'c1').should('be.visible');
      cy.getCell(6, 'c1').should('be.visible');
      cy.getCell(7, 'c1').should('be.visible');
      cy.getCell(5, 'c1').should('have.text', 'a');
      cy.getCell(6, 'c1').should('have.text', 'b');
      cy.getCell(7, 'c1').should('have.text', 'c');
    });

    it('specific parent that internal type.', () => {
      cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });
      cy.gridInstance().invoke('expand', 0, true);

      cy.getCell(5, 'c1').should('be.visible');
      cy.getCell(6, 'c1').should('be.visible');
      cy.getCell(7, 'c1').should('be.visible');
      cy.getCell(5, 'c1').should('have.text', 'a');
      cy.getCell(6, 'c1').should('have.text', 'b');
      cy.getCell(7, 'c1').should('have.text', 'c');

      cy.gridInstance().invoke('collapse', 0);
      cy.getCell(5, 'c1').should('be.not.visible');
      cy.getCell(6, 'c1').should('be.not.visible');
      cy.getCell(7, 'c1').should('be.not.visible');
    });

    it('specific parent that collapsed.', () => {
      cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 2 });
      cy.gridInstance().invoke('expand', 0);
      cy.gridInstance().invoke('expand', 2);

      cy.getCell(5, 'c1').should('have.text', 'a');
      cy.getCell(5, 'c1').should('be.visible');
      cy.getCell(6, 'c1').should('be.not.visible');
      cy.getCell(7, 'c1').should('be.not.visible');
    });
  });

  context('offset option', () => {
    const appendedData = {
      c1: 'a',
      _children: [{ c1: 'b' }, { c1: 'c' }]
    };

    function assertInsertedRow(rowKey: RowKey) {
      cy.getCell(rowKey, 'c1').should('have.text', 'a');
      cy.getCell(rowKey, 'c1').within(() => {
        cy.get(`.${cls('btn-tree')}`)
          .its('length')
          .should('be.eql', 1);
      });
    }

    it('inserts to the last when offset is not set.', () => {
      cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });
      cy.gridInstance().invoke('expand', 0);
      cy.gridInstance()
        .invoke('getChildRows', 0)
        .then((rows) => {
          const { rowKey } = rows[rows.length - 1];
          assertInsertedRow(rowKey);
        });
    });

    it('inserts to the first when offset is set 0.', () => {
      cy.gridInstance().invoke('appendTreeRow', appendedData, {
        parentRowKey: 0,
        offset: 0
      });
      cy.gridInstance().invoke('expand', 0);
      cy.gridInstance()
        .invoke('getChildRows', 0)
        .then((rows) => {
          const { rowKey } = rows[0];
          assertInsertedRow(rowKey);
        });
    });

    it('inserts to sepecific position.', () => {
      cy.gridInstance().invoke('appendTreeRow', { name: 'qux' }, { parentRowKey: 0 });
      cy.gridInstance().invoke('appendTreeRow', appendedData, {
        parentRowKey: 0,
        offset: 1
      });
      cy.gridInstance().invoke('expand', 0);
      cy.gridInstance()
        .invoke('getChildRows', 0)
        .then((rows) => {
          const { rowKey } = rows[1];
          assertInsertedRow(rowKey);
        });
    });
  });
});

describe('removeTreeRow()', () => {
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

  beforeEach(() => {
    cy.gridInstance().invoke('expand', 0, true);
  });

  it('removes leaf row.', () => {
    cy.getCell(3, 'c1')
      .its('length')
      .should('be.eql', 1);
    cy.gridInstance().invoke('removeTreeRow', 3);
    cy.getCell(3, 'c1').should('not.exist');
  });

  it('removes internal row.', () => {
    cy.getCell(2, 'c1')
      .its('length')
      .should('be.eql', 1);
    cy.gridInstance().invoke('removeTreeRow', 2);
    cy.getCell(2, 'c1').should('not.exist');
  });

  it('removes all descendant rows.', () => {
    cy.gridInstance()
      .invoke('getDescendantRows', 2)
      .then((rows) => {
        rows.forEach(({ rowKey }: Row) => {
          cy.getCell(rowKey, 'c1')
            .its('length')
            .should('be.eql', 1);
        });
      });

    cy.gridInstance().invoke('removeTreeRow', 1);

    cy.gridInstance()
      .invoke('getDescendantRows', 2)
      .then((rows) => {
        rows.forEach(({ rowKey }: Row) => {
          cy.getCell(rowKey, 'c1').should('not.exist');
        });
      });
  });

  context('parent row', () => {
    it('is changed to leaf row when all child rows.', () => {
      cy.gridInstance().invoke('expand', 0, true);

      assertInternalRow(2);
      cy.gridInstance().invoke('removeTreeRow', 3);
      assertLeafRow(2);
    });

    it('is not changed to leaf row when having child rows.', () => {
      cy.gridInstance().invoke('expand', 0, true);

      assertInternalRow(1);
      cy.gridInstance().invoke('removeTreeRow', 3);
      assertInternalRow(1);
    });
  });
});

it('attachs tree rows only expanded to DOM element.', () => {
  cy.get(`.${cls('rside-area')} .${cls('body-area')} tr`).should('have.length', 1);

  cy.gridInstance().invoke('expand', 0);
  cy.get(`.${cls('rside-area')} .${cls('body-area')} tr`).should('have.length', 3);

  cy.gridInstance().invoke('expand', 2);
  cy.get(`.${cls('rside-area')} .${cls('body-area')} tr`).should('have.length', 5);
});

describe('modified data is added', () => {
  it('when appending rows.', () => {
    cy.gridInstance().invoke('appendRow', {
      c1: 'a',
      _children: [
        {
          c1: 'b',
          _children: [{ c1: 'c' }]
        }
      ]
    });

    assertModifiedRowsLength('createdRows', 3);
  });

  it('when updating row.', () => {
    cy.gridInstance().invoke('setValue', 0, 'name', 'a');

    assertModifiedRowsLength('updatedRows', 1);
  });

  it('when removing rows.', () => {
    cy.gridInstance().invoke('expand', 0, true);
    cy.gridInstance().invoke('removeRow', 0);

    assertModifiedRowsLength('deletedRows', 5);
  });
});
