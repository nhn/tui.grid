import { RowKey, CellValue } from '@t/store/data';
import { OptColumn, OptGrid, OptRow } from '@t/options';
import { cls } from '../../src/helper/dom';
import GridEvent from '@/event/gridEvent';

type ModifiedType = 'createdRows' | 'updatedRows' | 'deletedRows';

const columns: OptColumn[] = [{ name: 'c1', editor: 'text' }, { name: 'c2' }];

const data = [
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

function assertColumnWidth(columnName: string, width: number) {
  cy.getColumnCells(columnName).each($el => {
    cy.wrap($el)
      .invoke('width')
      .should('eq', width);
  });
}

function assertGridHasRightRowNumber() {
  cy.getRowHeaderCells('_number').each(($el, idx) => {
    cy.wrap($el).should('have.text', `${idx + 1}`);
  });
}

function assertToggleButtonExpanded(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.getByCls('tree-extra-content').should('have.class', cls('tree-button-expand'));
  });
}

function assertToggleButtonCollapsed(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.getByCls('tree-extra-content').should('have.class', cls('tree-button-collapse'));
  });
}

function assertModifiedRowsLength(type: ModifiedType, length: number) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .its(type)
    .should('have.length', length);
}

function assertHasChildren(rowKey: RowKey, columnName: string, exist: boolean) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.getByCls('btn-tree').should(exist ? 'exist' : 'not.be.exist');
  });
}

function createGrid(options: Omit<OptGrid, 'el' | 'columns' | 'data'>) {
  cy.createGrid({
    data,
    columns,
    ...options
  });
}

function getRsideBodyRows() {
  return cy.get(`.${cls('rside-area')} .${cls('body-area')} tr`);
}

function editCell(rowKey: RowKey, columnName: string, value: CellValue) {
  cy.gridInstance().invoke('startEditing', rowKey, columnName);
  cy.getByCls('content-text').type(String(value));
  cy.gridInstance().invoke('finishEditing', rowKey, columnName);
}

function clickTreeBtn(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.getByCls('btn-tree').click();
  });
}

before(() => {
  cy.visit('/dist');
});

describe('treeColumnOptions', () => {
  context('name', () => {
    it('creates tree column.', () => {
      createGrid({
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
    beforeEach(() => {
      createGrid({
        treeColumnOptions: {
          name: 'c1'
        }
      });
    });

    it('creates icon on cell by default.', () => {
      cy.getCell(0, 'c1').within(() => {
        cy.getByCls('tree-icon')
          .its('length')
          .should('be.eql', 1);
      });
    });

    it('sets to false then icon is not created.', () => {
      createGrid({
        treeColumnOptions: {
          name: 'c1',
          useIcon: false
        }
      });

      cy.getCell(0, 'c1').within(() => {
        cy.getByCls('tree-icon').should('not.exist');
      });
    });
  });

  context('useCascading', () => {
    function assertCheckedRow(rowKey: RowKey, checked: boolean) {
      cy.getRowHeaderCell(rowKey, '_checked').within(() => {
        cy.get('[type="checkbox"]').should(checked ? 'be.checked' : 'not.be.checked');
      });
    }

    it('sets to true or by default then row is checked recursively by parent or child row is checked.', () => {
      createGrid({
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
  beforeEach(() => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });
  });

  it(`is created when row data has '_children' property.`, () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });
    cy.gridInstance().invoke('expand', 0, true);

    assertHasChildren(2, 'c1', true);
    assertHasChildren(3, 'c1', false);
    assertHasChildren(4, 'c1', true);
  });

  context(`sets 'expanded' attribute to`, () => {
    it(`true or by default then toggle button collapsed.`, () => {
      cy.gridInstance().invoke('expand', 0);

      assertToggleButtonExpanded(0, 'c1');
      assertToggleButtonExpanded(1, 'c1');
    });

    it(`false then toggle button collapsed.`, () => {
      cy.gridInstance().invoke('expand', 0);

      assertToggleButtonCollapsed(2, 'c1');
    });
  });

  ['UI', 'API'].forEach(type => {
    it(`from expanded to collapse by ${type}`, () => {
      cy.gridInstance().invoke('expand', 0);
      if (type === 'UI') {
        clickTreeBtn(1, 'c1');
      } else {
        cy.gridInstance().invoke('collapse', 1);
      }

      assertToggleButtonCollapsed(1, 'c1');
    });

    it(`from collapsed to expanded by ${type}`, () => {
      if (type === 'UI') {
        clickTreeBtn(0, 'c1');
      } else {
        cy.gridInstance().invoke('expand', 0);
      }

      assertToggleButtonExpanded(0, 'c1');
    });
  });
});

describe('collapse()', () => {
  beforeEach(() => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });
  });

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
  it('hides descendent rows.', () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });
    cy.gridInstance().invoke('expand', 0);

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');

    cy.gridInstance().invoke('collapseAll');

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('not.be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');
  });
});

describe('expand()', () => {
  beforeEach(() => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });
  });

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
  it('shows descendent rows.', () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });
    cy.gridInstance().invoke('expandAll');

    cy.getCell(0, 'c1').should('be.visible');
    cy.getCell(1, 'c1').should('be.visible');
    cy.getCell(2, 'c1').should('be.visible');
    cy.getCell(3, 'c1').should('be.visible');
  });
});

describe('appendRow()', () => {
  beforeEach(() => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });
  });

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

    cy.getCell(5, 'c1').should('have.text', 'a');
    cy.getCell(6, 'c1').should('have.text', 'b');
    cy.getCell(7, 'c1').should('have.text', 'c');
  });

  it('should make appended empty row overservable', () => {
    cy.gridInstance().invoke('appendRow');
    cy.gridInstance().invoke('setValue', 5, 'c1', 'observable');

    cy.getCell(5, 'c1').should('have.text', 'observable');
  });
});

describe('appendTreeRow()', () => {
  beforeEach(() => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      },
      rowHeaders: ['checkbox', 'rowNum']
    });
  });

  it('appends leaf row to specific parent.', () => {
    const appendedData = { c1: 'test' };

    cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });
    cy.gridInstance().invoke('expandAll');

    cy.getCell(5, 'c1').should('be.visible');
    cy.getCell(5, 'c1').should('have.text', 'test');

    cy.gridInstance().invoke('collapse', 0);

    cy.getCell(5, 'c1').should('be.not.visible');
  });

  it('should check the header checkbox of added data after calling appendTreeRow()', () => {
    const appendedData = { c1: 'test' };

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });

    cy.getHeaderCell('_checked')
      .find('input')
      .should('not.be.checked');
  });

  it('should check the children of added data with checked option', () => {
    const appendedData = {
      c1: 'test',
      _children: [{ c1: 'b' }, { c1: 'c' }],
      _attributes: { checked: true }
    };

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });

    cy.gridInstance()
      .invoke('getCheckedRows')
      .should('have.length', 8);
  });

  it('should update row number after calling appendTreeRow()', () => {
    const appendedData = { c1: 'test' };

    cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 1, offset: 0 });
    cy.gridInstance().invoke('expandAll');

    assertGridHasRightRowNumber();
  });

  context('appends internal row to', () => {
    let appendedData: OptRow;
    beforeEach(() => {
      appendedData = {
        c1: 'a',
        _children: [{ c1: 'b' }, { c1: 'c' }]
      };
    });

    it('root.', () => {
      cy.gridInstance().invoke('appendRow', appendedData);
      cy.gridInstance().invoke('expandAll');

      cy.getCell(5, 'c1').should('have.text', 'a');
      cy.getCell(6, 'c1').should('have.text', 'b');
      cy.getCell(7, 'c1').should('have.text', 'c');
    });

    it('specific parent that internal type.', () => {
      cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });
      cy.gridInstance().invoke('expand', 0, true);

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
      cy.getCell(6, 'c1').should('be.not.visible');
      cy.getCell(7, 'c1').should('be.not.visible');
    });
  });

  context('offset option', () => {
    let appendedData: OptRow;

    beforeEach(() => {
      appendedData = {
        c1: 'a',
        _children: [{ c1: 'b' }, { c1: 'c' }]
      };
    });

    function assertInsertedRow(offset: number) {
      cy.gridInstance()
        .invoke('getChildRows', 0)
        .its(`${offset}`)
        .then(row => {
          cy.getCell(row.rowKey, 'c1').should('have.text', 'a');
          assertHasChildren(row.rowKey, 'c1', true);
        });
    }

    it('inserts to the last when offset is not set.', () => {
      cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });
      cy.gridInstance().invoke('expand', 0);

      assertInsertedRow(appendedData._children!.length - 1);
    });

    it('inserts to the first when offset is set 0.', () => {
      cy.gridInstance().invoke('appendTreeRow', appendedData, {
        parentRowKey: 0,
        offset: 0
      });
      cy.gridInstance().invoke('expand', 0);

      assertInsertedRow(0);
    });

    it('inserts to specific position.', () => {
      cy.gridInstance().invoke('appendTreeRow', { name: 'qux' }, { parentRowKey: 0 });
      cy.gridInstance().invoke('appendTreeRow', appendedData, {
        parentRowKey: 0,
        offset: 1
      });
      cy.gridInstance().invoke('expand', 0);

      assertInsertedRow(1);
    });
  });
});

describe('removeTreeRow()', () => {
  beforeEach(() => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      },
      rowHeaders: ['checkbox', 'rowNum']
    });
    cy.gridInstance().invoke('expand', 0, true);
  });

  it('removes leaf row.', () => {
    cy.getCell(3, 'c1').should('exist');

    cy.gridInstance().invoke('removeTreeRow', 3);

    cy.getCell(3, 'c1').should('not.exist');
  });

  it('removes all descendant rows.', () => {
    assertHasChildren(1, 'c1', true);
    cy.getCell(2, 'c1').should('exist');
    cy.getCell(3, 'c1').should('exist');
    cy.getCell(4, 'c1').should('exist');

    cy.gridInstance().invoke('removeTreeRow', 2);

    assertHasChildren(1, 'c1', false);
    cy.getCell(2, 'c1').should('not.exist');
    cy.getCell(3, 'c1').should('not.exist');
    cy.getCell(4, 'c1').should('not.exist');
  });

  it('should check the header checkbox of added data after calling removeTreeRow()', () => {
    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('removeTreeRow', 3);

    cy.getHeaderCell('_checked')
      .find('input')
      .should('not.be.checked');
  });

  it('should update row number after calling removeTreeRow()', () => {
    cy.gridInstance().invoke('removeTreeRow', 3);
    cy.gridInstance().invoke('expandAll');

    assertGridHasRightRowNumber();
  });

  context('parent row', () => {
    it('is changed to leaf row when all child rows.', () => {
      assertHasChildren(2, 'c1', true);

      cy.gridInstance().invoke('removeTreeRow', 3);
      cy.gridInstance().invoke('removeTreeRow', 4);

      assertHasChildren(2, 'c1', false);
    });

    it('is not changed to leaf row when having child rows.', () => {
      assertHasChildren(1, 'c1', true);

      cy.gridInstance().invoke('removeTreeRow', 3);

      assertHasChildren(1, 'c1', true);
    });
  });
});

it('attaches tree rows only expanded to DOM element.', () => {
  createGrid({
    treeColumnOptions: {
      name: 'c1'
    }
  });

  getRsideBodyRows().should('have.length', 1);

  cy.gridInstance().invoke('expand', 0);

  getRsideBodyRows().should('have.length', 3);

  cy.gridInstance().invoke('expand', 2);

  getRsideBodyRows().should('have.length', 5);
});

describe('modified data is added', () => {
  beforeEach(() => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });
  });

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

describe('events', () => {
  context(`'expand' event`, () => {
    let callback: Function;

    beforeEach(() => {
      createGrid({
        treeColumnOptions: {
          name: 'c1'
        }
      });
      callback = cy.stub();
      cy.gridInstance().invoke('on', 'expand', callback);
    });

    ['UI', 'API'].forEach(type => {
      it(`The 'expand' event is emitted by ${type}.`, () => {
        if (type === 'UI') {
          clickTreeBtn(0, 'c1');
        } else {
          cy.gridInstance().invoke('expand', 0);
        }

        cy.wrap(callback).should('be.calledTwice');
      });
    });

    it(`The 'expand' event is emitted on all decsendant rows by calling expandAll API.`, () => {
      cy.gridInstance().invoke('expandAll');

      cy.wrap(callback).should('have.callCount', 4);
    });

    it(`The tree cell is not expanaded when the 'expand' event is stopped.`, () => {
      cy.gridInstance().invoke('on', 'expand', (ev: GridEvent) => {
        ev.stop();
      });

      cy.gridInstance().invoke('expand', 0);

      assertToggleButtonCollapsed(0, 'c1');
    });
  });

  context(`'collapse' event`, () => {
    let callback: Function;

    beforeEach(() => {
      createGrid({
        treeColumnOptions: {
          name: 'c1'
        }
      });
      callback = cy.stub();
      cy.gridInstance().invoke('on', 'collapse', callback);
    });

    ['UI', 'API'].forEach(type => {
      it(`The 'collapse' event is emitted by ${type}.`, () => {
        cy.gridInstance().invoke('expand', 0);
        if (type === 'UI') {
          clickTreeBtn(0, 'c1');
        } else {
          cy.gridInstance().invoke('collapse', 0);
        }

        cy.wrap(callback).should('have.calledOnce');
      });
    });

    it(`The 'collapse' event is emitted on all decsendant rows by calling collapseAll API.`, () => {
      cy.gridInstance().invoke('expandAll');
      cy.gridInstance().invoke('collapseAll');

      cy.wrap(callback).should('have.callCount', 4);
    });

    it(`The tree cell is not expanaded when the 'collapse' event is stopped.`, () => {
      cy.gridInstance().invoke('on', 'collapse', (ev: GridEvent) => {
        ev.stop();
      });

      cy.gridInstance().invoke('expand', 0);
      cy.gridInstance().invoke('collapse', 0);

      assertToggleButtonExpanded(0, 'c1');
    });
  });
});

describe('with resizable column options', () => {
  const DEPTH_ONE_MAX_WIDTH = 200;
  const DEPTH_TWO_MAX_WIDTH = 295;
  const DEPTH_THREE_MAX_WIDTH = 348;

  beforeEach(() => {
    data[0].c1 = 'looooooooooooooong contents';
    data[0]._children[0]._attributes.expanded = false;
    data[0]._children[0].c1 = 'looooooooooooooong child contents';
    data[0]._children[0]._children[0].c1 = 'looooooooooooooong child child contents';

    columns[0].width = DEPTH_ONE_MAX_WIDTH;
    columns[0].resizable = true;
  });

  it('width not automatically resize when expanded without resizable option', () => {
    columns[0].resizable = false;
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });

    cy.gridInstance().invoke('expand', 0);

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);
  });

  ['UI', 'API'].forEach(type => {
    it(`width resize automatically when expand by ${type}`, () => {
      createGrid({
        treeColumnOptions: {
          name: 'c1'
        }
      });

      assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

      if (type === 'API') {
        cy.gridInstance().invoke('expand', 0);
      } else {
        cy.getByCls('btn-tree').click();
      }

      assertColumnWidth('c1', DEPTH_TWO_MAX_WIDTH);
    });
  });

  it('width is not resized when existing width is wider than child node width', () => {
    data[0]._children[0].c1 = 'short';

    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

    cy.gridInstance().invoke('expand', 0);

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);
  });

  it('width resize automatically with child expanded attribute', () => {
    data[0]._children[0]._attributes.expanded = true;

    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

    cy.gridInstance().invoke('expand', 0);

    assertColumnWidth('c1', DEPTH_THREE_MAX_WIDTH);
  });

  it('width resize automatically when call expandAll()', () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

    cy.gridInstance().invoke('expandAll');

    assertColumnWidth('c1', DEPTH_THREE_MAX_WIDTH);
  });
});

describe('editing tree cell', () => {
  it('should change the tree cell properly', () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });

    editCell(0, 'c1', 'FOO');

    cy.getCell(0, 'c1').should('have.text', 'FOO');
  });

  it('should not be able to edit the collpased tree cell', () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1'
      }
    });

    cy.gridInstance().invoke('startEditing', 1, 'c1');

    cy.getByCls('layer-editing').should('not.be.visible');
  });
});
