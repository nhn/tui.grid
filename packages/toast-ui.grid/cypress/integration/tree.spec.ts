import { CellValue, RowKey } from '@t/store/data';
import { OptColumn, OptGrid, OptRow } from '@t/options';
import GridEvent from '@/event/gridEvent';
import { CellRenderer, CellRendererProps } from '@t/renderer';
import { cls } from '../../src/helper/dom';
import {
  assertGridHasRightRowNumber,
  assertModifiedRowsLength,
  assertToggleButtonCollapsed,
  assertToggleButtonExpanded,
} from '../helper/assert';
import { dragAndDropColumn, dragAndDropRow } from '../helper/util';

const columns: OptColumn[] = [{ name: 'c1', editor: 'text' }, { name: 'c2' }];

const data = [
  {
    c1: 'foo',
    _children: [
      {
        c1: 'bar',
        _attributes: {
          expanded: true,
        },
        _children: [
          {
            c1: 'baz',
            _attributes: {
              expanded: false,
            },
            _children: [
              {
                c1: 'qux',
              },
              {
                c1: 'quxx',
                _children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

function assertColumnWidth(columnName: string, width: number) {
  cy.getColumnCells(columnName).each(($el) => {
    cy.wrap($el).invoke('width').should('eq', width);
  });
}

function assertHasChildren(rowKey: RowKey, columnName: string, exist: boolean) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.getByCls('btn-tree').should(exist ? 'exist' : 'not.be.exist');
  });
}

function assertColumnHeaderAndData(headerData: string[][], cellData: string[][]) {
  cy.getRsideHeader().should('have.headerData', headerData);
  cy.getRsideBody().should('have.cellData', cellData);
}

function createGrid(options: Omit<OptGrid, 'el' | 'columns' | 'data'>) {
  cy.createGrid({
    data,
    columns,
    ...options,
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
          name: 'c2',
        },
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
          name: 'c1',
        },
      });
    });

    it('creates icon on cell by default.', () => {
      cy.getCell(0, 'c1').within(() => {
        cy.getByCls('tree-icon').its('length').should('be.eql', 1);
      });
    });

    it('sets to false then icon is not created.', () => {
      createGrid({
        treeColumnOptions: {
          name: 'c1',
          useIcon: false,
        },
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
          useCascadingCheckbox: true,
        },
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
          useCascadingCheckbox: false,
        },
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
        name: 'c1',
      },
    });
  });

  it(`is created when row data has '_children' property.`, () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1',
      },
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

  ['UI', 'API'].forEach((type) => {
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
        name: 'c1',
      },
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
        name: 'c1',
      },
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
        name: 'c1',
      },
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
        name: 'c1',
      },
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
        name: 'c1',
      },
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
      _children: [{ c1: 'b' }, { c1: 'c' }],
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
        name: 'c1',
      },
      rowHeaders: ['checkbox', 'rowNum'],
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

    cy.getHeaderCell('_checked').find('input').should('not.be.checked');
  });

  it('should check the children of added data with checked option', () => {
    const appendedData = {
      c1: 'test',
      _children: [{ c1: 'b' }, { c1: 'c' }],
      _attributes: { checked: true },
    };

    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });

    cy.gridInstance().invoke('getCheckedRows').should('have.length', 8);
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
        _children: [{ c1: 'b' }, { c1: 'c' }],
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
      cy.gridInstance().invoke('expand', 5, true);

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
        _children: [{ c1: 'b' }, { c1: 'c' }],
      };
    });

    function assertInsertedRow(offset: number) {
      cy.gridInstance()
        .invoke('getChildRows', 0)
        .its(`${offset}`)
        .then((row) => {
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
        offset: 0,
      });
      cy.gridInstance().invoke('expand', 0);

      assertInsertedRow(0);
    });

    it('inserts to specific position.', () => {
      cy.gridInstance().invoke('appendTreeRow', { name: 'qux' }, { parentRowKey: 0 });
      cy.gridInstance().invoke('appendTreeRow', appendedData, {
        parentRowKey: 0,
        offset: 1,
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
        name: 'c1',
      },
      rowHeaders: ['checkbox', 'rowNum'],
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

    cy.getHeaderCell('_checked').find('input').should('not.be.checked');
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
      name: 'c1',
    },
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
        name: 'c1',
      },
    });
  });

  it('when appending rows.', () => {
    cy.gridInstance().invoke('appendRow', {
      c1: 'a',
      _children: [
        {
          c1: 'b',
          _children: [{ c1: 'c' }],
        },
      ],
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
          name: 'c1',
        },
      });
      callback = cy.stub();
      cy.gridInstance().invoke('on', 'expand', callback);
    });

    ['UI', 'API'].forEach((type) => {
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
          name: 'c1',
        },
      });
      callback = cy.stub();
      cy.gridInstance().invoke('on', 'collapse', callback);
    });

    ['UI', 'API'].forEach((type) => {
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
  const DEPTH_ONE_MAX_WIDTH = 199;
  const DEPTH_TWO_MAX_WIDTH = 304;
  const DEPTH_THREE_MAX_WIDTH = 356;

  let targetData: OptRow[] = [];
  let targetColumns: OptColumn[] = [];

  function createGridWidthResizableOption() {
    cy.createGrid({
      data: targetData,
      columns: targetColumns,
      treeColumnOptions: {
        name: 'c1',
      },
    });
  }

  beforeEach(() => {
    targetColumns = [
      { name: 'c1', editor: 'text', width: DEPTH_ONE_MAX_WIDTH, resizable: true },
      { name: 'c2' },
    ];
    targetData = [
      {
        c1: 'looooooooooooooong contents',
        _children: [
          {
            c1: 'looooooooooooooong child contents',
            _attributes: {
              expanded: false,
            },
            _children: [
              {
                c1: 'looooooooooooooong child child contents',
                _attributes: {
                  expanded: false,
                },
                _children: [
                  {
                    c1: 'qux',
                  },
                  {
                    c1: 'quxx',
                    _children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
  });

  it('width should not be automatically resize when expanding without resizable option', () => {
    targetColumns[0].resizable = false;
    createGridWidthResizableOption();

    cy.gridInstance().invoke('expand', 0);

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);
  });

  ['UI', 'API'].forEach((type) => {
    it(`width should be resized automatically when expanding by ${type}`, () => {
      createGridWidthResizableOption();

      assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

      if (type === 'API') {
        cy.gridInstance().invoke('expand', 0);
      } else {
        cy.getByCls('btn-tree').click();
      }

      assertColumnWidth('c1', DEPTH_TWO_MAX_WIDTH);
    });
  });

  it('width should not be resized when existing width is wider than child node width', () => {
    targetData[0]._children![0].c1 = 'short';
    createGridWidthResizableOption();

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

    cy.gridInstance().invoke('expand', 0);

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);
  });

  it('width should be resized automatically with child expanded attribute', () => {
    targetData[0]._children![0]._attributes!.expanded = true;
    createGridWidthResizableOption();

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

    cy.gridInstance().invoke('expand', 0);

    assertColumnWidth('c1', DEPTH_THREE_MAX_WIDTH);
  });

  it('width should be resized automatically when calling expandAll()', () => {
    createGridWidthResizableOption();

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

    cy.gridInstance().invoke('expandAll');

    assertColumnWidth('c1', DEPTH_THREE_MAX_WIDTH);
  });

  it('width should be resized with custom renderer automatically when calling expandAll()', () => {
    class CustomRenderer implements CellRenderer {
      private el: HTMLElement;

      constructor(props: CellRendererProps) {
        const el = document.createElement('div');

        this.el = el;
        this.render(props);
      }

      getElement() {
        return this.el;
      }

      render(props: CellRendererProps) {
        this.el.innerText = props.formattedValue || '';
      }
    }

    targetColumns[0].renderer = CustomRenderer;
    createGridWidthResizableOption();

    assertColumnWidth('c1', DEPTH_ONE_MAX_WIDTH);

    cy.gridInstance().invoke('expandAll');

    assertColumnWidth('c1', DEPTH_THREE_MAX_WIDTH);
  });
});

describe('editing tree cell', () => {
  it('should change the tree cell properly', () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1',
      },
    });

    editCell(0, 'c1', 'FOO');

    cy.getCell(0, 'c1').should('have.text', 'FOO');
  });

  it('should not be able to edit the collpased tree cell', () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1',
      },
    });

    cy.gridInstance().invoke('startEditing', 1, 'c1');

    cy.getByCls('layer-editing').should('not.be.visible');
  });

  it('should not display the hidden child nodes after editing the cell', () => {
    createGrid({
      treeColumnOptions: {
        name: 'c1',
      },
    });
    cy.gridInstance().invoke('expandAll');
    cy.gridInstance().invoke('collapse', 0);

    editCell(0, 'c1', 'FOO');

    cy.getCell(0, 'c1').should('have.text', 'FOO');
    cy.getCell(1, 'c1').should('not.be.visible');
    cy.getCell(2, 'c1').should('not.be.visible');
    cy.getCell(3, 'c1').should('not.be.visible');
    cy.getCell(4, 'c1').should('not.be.visible');
  });
});

interface ModifiedRowsMap {
  createdRows?: Record<string, any>[];
  updatedRows?: Record<string, any>[];
  deletedRows?: Record<string, any>[];
}

describe('should extend the width with `width: auto` option as text length', () => {
  beforeEach(() => {
    cy.createGrid({
      data,
      columns: [{ name: 'c1', width: 'auto', minWidth: 150 }, { name: 'c2' }],
      treeColumnOptions: {
        name: 'c1',
      },
    });
  });

  it('initial rendering', () => {
    assertColumnWidth('c1', 166);
  });

  it('after calling appendTreeRow()', () => {
    const appendedData = { c1: 'loooooooooooooooooooooooooooooooooooooog test data', c2: 'test' };

    assertColumnWidth('c1', 166);

    cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });

    assertColumnWidth('c1', 433);
  });

  it('after calling removeTreeRow()', () => {
    const appendedData = { c1: 'loooooooooooooooooooooooooooooooooooooog test data', c2: 'test' };

    cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 0 });
    cy.gridInstance().invoke('removeTreeRow', 5);

    assertColumnWidth('c1', 166);
  });
});

describe('origin data', () => {
  beforeEach(() => {
    cy.createGrid({
      data,
      columns: [{ name: 'c1' }, { name: 'c2' }],
      treeColumnOptions: {
        name: 'c1',
      },
    });
    cy.gridInstance().invoke('expandAll');
  });

  it('should restore the data after calling resetOriginData API', () => {
    cy.gridInstance().invoke('resetOriginData');
    cy.gridInstance().invoke('restore');

    cy.getCell(0, 'c1').should('have.text', 'foo');
    assertToggleButtonCollapsed(0, 'c1');
  });
});

describe('move tree row', () => {
  function assertModifiedRowsContainsObject(modifiedRowsMap: ModifiedRowsMap) {
    cy.gridInstance()
      .invoke('getModifiedRows')
      .should((rowsMap) => {
        Object.keys(modifiedRowsMap).forEach((type) => {
          const rows = rowsMap[type];

          for (let i = 0; i < rows.length; i += 1) {
            expect(rows[i]).to.contain(modifiedRowsMap[type as keyof ModifiedRowsMap]![i]);
          }
        });
      });
  }

  beforeEach(() => {
    const treeData = [
      {
        c1: 'foo',
        _children: [
          {
            c1: 'bar',
            _attributes: {
              expanded: true,
            },
            _children: [
              {
                c1: 'baz',
                _attributes: {
                  expanded: false,
                },
                _children: [
                  {
                    c1: 'qux',
                  },
                  {
                    c1: 'quxx',
                    _children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        c1: 'foo_2',
        _children: [
          {
            c1: 'bar_2',
          },
        ],
      },
      { c1: 'baz_2' },
    ];

    cy.createGrid({
      data: treeData,
      draggable: true,
      columns: [{ name: 'c1' }],
      treeColumnOptions: {
        name: 'c1',
      },
    });
    cy.gridInstance().invoke('expandAll');
  });

  ['UI(D&D)', 'API'].forEach((type) => {
    it(`should move the row as the child of an another row by ${type}`, () => {
      if (type === 'API') {
        cy.gridInstance().invoke('moveRow', 1, 5, { appended: true });
      } else {
        // move 'bar' row to 'foo_2' first child
        dragAndDropRow(1, 280);
      }

      cy.getRsideBody().should('have.cellData', [
        ['foo'],
        ['foo_2'],
        ['bar_2'],
        ['bar'],
        ['baz'],
        ['qux'],
        ['quxx'],
        ['baz_2'],
      ]);
      // 'foo' row
      assertHasChildren(0, 'c1', false);
      // 'foo_2' row
      assertHasChildren(5, 'c1', true);
    });

    it(`should move the row to an another row's index by ${type}`, () => {
      if (type === 'API') {
        cy.gridInstance().invoke('moveRow', 6, 1);
      } else {
        // move 'bar_2' row to first index of 'foo' row
        dragAndDropRow(6, 90);
      }

      cy.getRsideBody().should('have.cellData', [
        ['foo'],
        ['bar_2'],
        ['bar'],
        ['baz'],
        ['qux'],
        ['quxx'],
        ['foo_2'],
        ['baz_2'],
      ]);
      // 'foo_2' row
      assertHasChildren(5, 'c1', false);
    });

    it(`should move the row to root index by ${type}`, () => {
      if (type === 'API') {
        cy.gridInstance().invoke('moveRow', 6, 0);
      } else {
        // move 'bar' row to first index of root
        dragAndDropRow(6, 48);
      }

      cy.getRsideBody().should('have.cellData', [
        ['bar_2'],
        ['foo'],
        ['bar'],
        ['baz'],
        ['qux'],
        ['quxx'],
        ['foo_2'],
        ['baz_2'],
      ]);
      // 'foo_2' row
      assertHasChildren(5, 'c1', false);
    });

    it(`should move the row to an another leaf node by ${type}`, () => {
      if (type === 'API') {
        cy.gridInstance().invoke('moveRow', 6, 3, { appended: true });
      } else {
        // move 'bar_2' row to leaf node(qux row)
        dragAndDropRow(6, 180);
      }

      cy.gridInstance().invoke('expandAll');

      cy.getRsideBody().should('have.cellData', [
        ['foo'],
        ['bar'],
        ['baz'],
        ['qux'],
        ['bar_2'],
        ['quxx'],
        ['foo_2'],
        ['baz_2'],
      ]);
      // 'qux' row
      assertHasChildren(3, 'c1', true);
    });

    it(`should move the row to last node by ${type}`, () => {
      if (type === 'API') {
        cy.gridInstance().invoke('moveRow', 0, 7);
      } else {
        // move 'foo' row to last node(baz_2 row)
        dragAndDropRow(0, 600);
      }

      cy.gridInstance().invoke('expandAll');

      cy.getRsideBody().should('have.cellData', [
        ['foo_2'],
        ['bar_2'],
        ['baz_2'],
        ['foo'],
        ['bar'],
        ['baz'],
        ['qux'],
        ['quxx'],
      ]);
    });

    it(`should not move the disabled row by ${type}`, () => {
      cy.gridInstance().invoke('disableRow', 0);

      if (type === 'API') {
        cy.gridInstance().invoke('moveRow', 0, 7);
      } else {
        dragAndDropRow(0, 600);
      }

      cy.getRsideBody().should('have.cellData', [
        ['foo'],
        ['bar'],
        ['baz'],
        ['qux'],
        ['quxx'],
        ['foo_2'],
        ['bar_2'],
        ['baz_2'],
      ]);
    });

    it(`should not append the row to disabled row by ${type}`, () => {
      cy.gridInstance().invoke('disableRow', 7);

      if (type === 'API') {
        cy.gridInstance().invoke('moveRow', 0, 7, { appended: true });
      } else {
        dragAndDropRow(0, 340);
      }

      cy.getRsideBody().should('have.cellData', [
        ['foo'],
        ['bar'],
        ['baz'],
        ['qux'],
        ['quxx'],
        ['foo_2'],
        ['bar_2'],
        ['baz_2'],
      ]);
    });
  });

  it('should pass the `appended: false` prop when triggering drop event on moving index', () => {
    const stub = cy.stub();
    cy.gridInstance().invoke('on', 'drop', stub);

    // move 'bar' row to first index of root
    dragAndDropRow(6, 48);

    cy.wrap(stub).should('be.calledWithMatch', {
      rowKey: 6,
      targetRowKey: 0,
      appended: false,
    });
  });

  it('should pass the `appended: true` prop when triggering drag event on appending to an another node', () => {
    const stub = cy.stub();
    cy.gridInstance().invoke('on', 'drag', stub);

    // move 'bar_2' row to leaf node(qux row)
    cy.getCell(6, '_draggable')
      .trigger('mousedown')
      .trigger('mousemove', { pageY: 180, force: true });

    cy.wrap(stub).should('be.calledWithMatch', {
      rowKey: 6,
      targetRowKey: 3,
      appended: true,
    });
  });

  it('should pass the `targetRowKey: null` prop when triggering drag event on moving at the bottomost', () => {
    const stub = cy.stub();
    cy.gridInstance().invoke('on', 'drag', stub);

    // move 'bar_2' row to leaf node(qux row)
    cy.getCell(6, '_draggable')
      .trigger('mousedown')
      .trigger('mousemove', { pageY: 370, force: true });

    cy.wrap(stub).should('be.calledWithMatch', {
      rowKey: 6,
      targetRowKey: null,
      appended: false,
    });
  });

  it('should pass the `appended: true` prop when triggering drop event on appending to an another node', () => {
    const stub = cy.stub();
    cy.gridInstance().invoke('on', 'drop', stub);

    // move 'bar_2' row to leaf node(qux row)
    dragAndDropRow(6, 180);

    cy.wrap(stub).should('be.calledWithMatch', {
      rowKey: 6,
      targetRowKey: 3,
      appended: true,
    });
  });

  it('should pass the `targetRowKey: null` prop when triggering drop event on moving at the bottommost', () => {
    const stub = cy.stub();
    cy.gridInstance().invoke('on', 'drop', stub);

    // move 'bar_2' row to leaf node(qux row)
    dragAndDropRow(6, 370);

    cy.wrap(stub).should('be.calledWithMatch', {
      rowKey: 6,
      targetRowKey: null,
      appended: false,
    });
  });

  it('should move node to the last regardless of the children properly', () => {
    // move to last in case of having children
    cy.gridInstance().invoke('moveRow', 2, 7);

    cy.getRsideBody().should('have.cellData', [
      ['foo'],
      ['bar'],
      ['foo_2'],
      ['bar_2'],
      ['baz_2'],
      ['baz'],
      ['qux'],
      ['quxx'],
    ]);

    // move to last in case of leaf node(baz_2)
    cy.gridInstance().invoke('moveRow', 7, 7);

    cy.getRsideBody().should('have.cellData', [
      ['foo'],
      ['bar'],
      ['foo_2'],
      ['bar_2'],
      ['baz'],
      ['qux'],
      ['quxx'],
      ['baz_2'],
    ]);
  });

  it('should be added to modifiedDataManager with "UPDATE" code', () => {
    cy.gridInstance().invoke('moveRow', 0, 7, { appended: true });

    assertModifiedRowsContainsObject({
      updatedRows: [
        { c1: 'baz_2' },
        { c1: 'foo' },
        { c1: 'bar' },
        { c1: 'baz' },
        { c1: 'qux' },
        { c1: 'quxx' },
      ],
    });
  });
});

describe('move column with tree', () => {
  const originalHeader = [['genre', 'name', 'price']];
  const originalData = [
    ['Pop', '2002', '100'],
    ['Rock', 'radioactive', '200'],
    ['R&B', 'something', '300'],
    ['Rap', '99 problems', '400'],
  ];

  beforeEach(() => {
    const treeData = [
      { genre: 'Pop', name: '2002', price: 100 },
      { genre: 'Rock', name: 'radioactive', price: 200 },
      { genre: 'R&B', name: 'something', price: 300 },
      { genre: 'Rap', name: '99 problems', price: 400 },
    ];
    const treeColumns = [{ name: 'genre' }, { name: 'name' }, { name: 'price' }];
    const treeColumnOptions = {
      name: 'genre',
      useCascadingCheckbox: true,
    };

    cy.createGrid({
      data: treeData,
      columns: treeColumns,
      bodyHeight: 400,
      draggable: true,
      treeColumnOptions,
    });
  });

  ['UI(D&D)', 'API'].forEach((type) => {
    it(`should not move the column by ${type} if it is tree columns`, () => {
      assertColumnHeaderAndData(originalHeader, originalData);

      if (type === 'API') {
        cy.gridInstance().invoke('moveColumn', 'genre', 3);
      } else {
        dragAndDropColumn('genre', 550);
      }

      assertColumnHeaderAndData(originalHeader, originalData);
    });

    it(`should move the column by ${type} if it has tree columns but it is not tree column`, () => {
      assertColumnHeaderAndData(originalHeader, originalData);

      if (type === 'API') {
        cy.gridInstance().invoke('moveColumn', 'name', 3);
      } else {
        dragAndDropColumn('name', 550);
      }

      assertColumnHeaderAndData(
        [['genre', 'price', 'name']],
        [
          ['Pop', '100', '2002'],
          ['Rock', '200', 'radioactive'],
          ['R&B', '300', 'something'],
          ['Rap', '400', '99 problems'],
        ]
      );
    });

    it(`should not move the column by ${type} if the column of target position is tree column`, () => {
      assertColumnHeaderAndData(originalHeader, originalData);

      if (type === 'API') {
        cy.gridInstance().invoke('moveColumn', 'name', 1);
      } else {
        dragAndDropColumn('name', 100);
      }

      assertColumnHeaderAndData(originalHeader, originalData);
    });
  });
});

function createTreeGridWithComplcatedData() {
  const treeData = [
    {
      hrDept: 'dept1',
      _children: [
        {
          hrDept: 'dept2',
        },
        {
          hrDept: 'dept3',
          _children: [
            {
              hrDept: 'dept4',
              _children: [
                {
                  hrDept: 'dept5',
                },
              ],
              _attributes: {
                expanded: true,
              },
            },
            {
              hrDept: 'dept6',
            },
            {
              hrDept: 'dept7',
            },
          ],
          _attributes: {
            expanded: true,
          },
        },
        {
          hrDept: 'dept8',
        },
      ],
      _attributes: {
        expanded: true,
      },
    },
    {
      hrDept: 'dept9',
      _children: [
        {
          hrDept: 'dept10',
        },
        {
          hrDept: 'dept11',
          _children: [
            {
              hrDept: 'dept12',
            },
          ],
          _attributes: {
            expanded: true,
          },
        },
        {
          hrDept: 'dept13',
          _children: [
            {
              hrDept: 'dept14',
              _children: [
                {
                  hrDept: 'dept15',
                },
                {
                  hrDept: 'dept16',
                },
              ],
              _attributes: {
                expanded: true,
              },
            },
            {
              hrDept: 'dept17',
            },
          ],
          _attributes: {
            expanded: true,
          },
        },
        {
          hrDept: 'dept18',
          _children: [
            {
              hrDept: 'dept19',
            },
          ],
          _attributes: {
            expanded: true,
          },
        },
      ],
      _attributes: {
        expanded: true,
      },
    },
    {
      hrDept: 'dept20',
    },
  ];

  cy.createGrid({
    data: treeData,
    draggable: true,
    bodyHeight: 300,
    columns: [{ name: 'hrDept' }],
    treeColumnOptions: {
      name: 'hrDept',
    },
  });
}

it('should move the row to with complicated data', () => {
  createTreeGridWithComplcatedData();
  // move 'dept7' row to 'dept6'
  cy.gridInstance().invoke('moveRow', 6, 5);

  cy.getRsideBody().should('have.cellData', [
    ['dept1'],
    ['dept2'],
    ['dept3'],
    ['dept4'],
    ['dept5'],
    ['dept7'],
    ['dept6'],
    ['dept8'],
  ]);
});

it('should update row number after calling appendTreeRow()', () => {
  createTreeGridWithComplcatedData();

  const appendedData = {
    hrDept: 'test',
    _children: [{ hrDept: 'test1' }, { hrDept: 'test2' }, { hrDept: 'test3' }],
  };

  cy.gridInstance().invoke('appendTreeRow', appendedData, { parentRowKey: 2, focus: true });
  cy.gridInstance().invoke('expandAll');

  cy.getRsideBody().should('have.cellData', [
    ['dept1'],
    ['dept2'],
    ['dept3'],
    ['dept4'],
    ['dept5'],
    ['dept6'],
    ['dept7'],
    ['test'],
    ['test1'],
  ]);
});

it('should not apply dynamic rowSpan', () => {
  const treeColumnsWithRowSpan = columns.map((column) => {
    column.rowSpan = true;
    return column;
  });
  cy.createGrid({
    data,
    columns: treeColumnsWithRowSpan,
    treeColumnOptions: {
      name: 'c1',
    },
  });

  ['c1', 'c2'].forEach((columnName) => {
    cy.getColumnCells(columnName).each(($el) => {
      cy.wrap($el).should('not.have.attr', 'rowSpan');
    });
  });
});
