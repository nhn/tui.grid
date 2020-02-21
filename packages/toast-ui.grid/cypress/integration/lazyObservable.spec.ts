import { RowKey } from '../../types/store/data';
import { data } from '../../samples/basic';
import { lazyObserbableTestdata as treeData } from '../../samples/tree';
import { cls } from '@/helper/dom';

function assertToggleButtonExpanded(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.getByCls('tree-extra-content').should('have.class', cls('tree-button-expand'));
  });
}

function assertToggleButtonCollapsed(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.getByCls('tree-extra-content').should('not.have.class', cls('tree-button-expand'));
  });
}

function assertCheckedState(checked: boolean) {
  cy.get('input').should($el => {
    $el.each((_, elem) => {
      expect(elem.checked).eq(checked);
    });
  });
}

function assertDisabledState(disabled: boolean) {
  cy.get('input').should($el => {
    $el.each((_, elem) => {
      expect(elem.disabled).eq(disabled);
    });
  });
}

function scrollToBottom() {
  // sometimes cypress scrollTo is not worked
  // cy.get(`.${cls('lside-area')} .${cls('body-area')}`).scrollTo(0, 300);

  // to move scroll position
  cy.focusToBottomCell(19, 'name');
}

before(() => {
  cy.visit('/dist');
});

describe('should API is executed properly on lazy observable data', () => {
  beforeEach(() => {
    const columns = [
      { name: 'name', editor: 'text' },
      { name: 'artist', editor: 'text' },
      { name: 'type', editor: 'text' }
    ];

    cy.createGrid({
      data,
      columns,
      rowHeaders: ['checkbox'],
      bodyHeight: 300
    });
  });

  it('startEditing()', () => {
    cy.gridInstance().invoke('startEditing', 18, 'name', 'Lee');

    cy.getByCls('content-text').should('be.visible');
  });

  it('finishEditing()', () => {
    cy.gridInstance().invoke('startEditing', 18, 'name');
    cy.gridInstance().invoke('finishEditing', 18, 'name', 'Kim');

    cy.gridInstance()
      .invoke('getValue', 18, 'name')
      .should('eq', 'Kim');
    cy.getCell(18, 'name').should('have.text', 'Kim');
  });

  it('checkAll() / uncheckAll()', () => {
    cy.gridInstance().invoke('checkAll');

    cy.gridInstance()
      .invoke('getCheckedRowKeys')
      .should('have.length', 20);

    scrollToBottom();

    assertCheckedState(true);

    cy.gridInstance().invoke('uncheckAll');

    cy.gridInstance()
      .invoke('getCheckedRowKeys')
      .should('have.length', 0);

    assertCheckedState(false);
  });

  it('check() / uncheck()', () => {
    cy.gridInstance().invoke('checkAll');
    cy.gridInstance().invoke('uncheck', 18);

    scrollToBottom();

    cy.getRowHeaderCell(18, '_checked')
      .find('input')
      .should('be.not.checked');

    cy.gridInstance().invoke('check', 18);

    assertCheckedState(true);
  });

  it('findRow()', () => {
    cy.gridInstance()
      .invoke('findRows', { name: '21' })
      .should('have.length', 1);
  });

  it('disable()', () => {
    cy.gridInstance().invoke('disable');

    assertDisabledState(true);
    cy.getBodyCells().each($el => {
      cy.wrap($el).should('have.class', cls('cell-disabled'));
    });

    scrollToBottom();

    assertDisabledState(true);
    cy.getBodyCells().each($el => {
      cy.wrap($el).should('have.class', cls('cell-disabled'));
    });
  });

  it('disableRow()', () => {
    cy.gridInstance().invoke('disableRow', 17);

    scrollToBottom();

    cy.getRow(17).each($el => {
      cy.wrap($el).should('have.class', cls('cell-disabled'));
    });
  });

  it('disableRowCheck()', () => {
    cy.gridInstance().invoke('disableRowCheck', 18);

    scrollToBottom();

    cy.getRow(18).each(($el, index) => {
      if (!index) {
        // checkbox
        cy.wrap($el).should('have.class', cls('cell-disabled'));
      } else {
        cy.wrap($el).should('not.have.class', cls('cell-disabled'));
      }
    });
  });

  it('addCellClassName() / removeCellClassName()', () => {
    cy.gridInstance().invoke('addCellClassName', 17, 'name', 'tui-grid-cell-test');
    cy.gridInstance().invoke('removeCellClassName', 17, 'name', 'tui-grid-cell-test');
    cy.gridInstance().invoke('addCellClassName', 18, 'name', 'tui-grid-cell-test');

    scrollToBottom();

    cy.getCell(17, 'name').should('not.have.class', 'tui-grid-cell-test');
    cy.getCell(18, 'name').should('have.class', 'tui-grid-cell-test');
  });

  it('addRowClassName() / removeRowClassName()', () => {
    cy.gridInstance().invoke('addRowClassName', 17, 'tui-grid-cell-test');
    cy.gridInstance().invoke('removeRowClassName', 17, 'tui-grid-cell-test');
    cy.gridInstance().invoke('addRowClassName', 18, 'tui-grid-cell-test');

    scrollToBottom();

    cy.getRow(17).each($el => {
      cy.wrap($el).should('not.have.class', 'tui-grid-cell-test');
    });
    cy.getRow(18).each($el => {
      cy.wrap($el).should('have.class', 'tui-grid-cell-test');
    });
  });

  it('appendRow()', () => {
    cy.gridInstance().invoke(
      'appendRow',
      { name: 'Lee', artist: 'Lee', type: 'test' },
      { focus: true }
    );

    cy.getCell(20, 'name').should('have.text', 'Lee');
  });

  it('resetData()', () => {
    scrollToBottom();

    cy.gridInstance().invoke('resetData', [{ name: 'Lee', artist: 'Lee', type: 'test' }]);

    cy.getRsideBody()
      .invoke('scrollTop')
      .should('eq', 0);
    cy.getRsideBody().should('have.cellData', [['Lee', 'Lee', 'test']]);
  });

  it('clear()', () => {
    scrollToBottom();

    cy.gridInstance().invoke('clear');

    cy.getRsideBody()
      .invoke('scrollTop')
      .should('eq', 0);
    cy.getBodyCells().should('not.exist');
  });

  it('setColumns()', () => {
    scrollToBottom();

    cy.gridInstance().invoke('setColumns', [
      { name: 'name' },
      { name: 'artist' },
      { name: 'type' }
    ]);

    cy.getRsideBody()
      .invoke('scrollTop')
      .should('eq', 0);
  });
});

describe('should API is executed properly on lazy observable data(tree)', () => {
  beforeEach(() => {
    const columns = [{ name: 'name' }, { name: 'artist' }, { name: 'type' }];

    cy.createGrid({
      data: treeData,
      columns,
      bodyHeight: 400,
      treeColumnOptions: {
        name: 'name',
        useIcon: false
      }
    });
  });

  it('expandAll()', () => {
    cy.gridInstance().invoke('expandAll');

    scrollToBottom();

    assertToggleButtonExpanded(12, 'name');
    assertToggleButtonExpanded(13, 'name');
    assertToggleButtonExpanded(14, 'name');
    assertToggleButtonExpanded(15, 'name');
  });

  it('collapseAll()', () => {
    cy.gridInstance().invoke('expandAll');
    cy.gridInstance().invoke('collapseAll');

    scrollToBottom();

    assertToggleButtonCollapsed(12, 'name');
    cy.getCell(13, 'name').should('be.not.exist');
    cy.getCell(14, 'name').should('be.not.exist');
    cy.getCell(15, 'name').should('be.not.exist');
  });

  it('expand(), collapse()', () => {
    cy.gridInstance().invoke('expand', 12);
    cy.gridInstance().invoke('expand', 14);
    cy.gridInstance().invoke('collapse', 14);

    scrollToBottom();

    assertToggleButtonExpanded(12, 'name');
    assertToggleButtonCollapsed(14, 'name');
    cy.getCell(15, 'name').should('be.not.exist');
  });
});

it('columns are observable even if not specify value', () => {
  const columns = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
  const smallData = [
    { A: 10, B: 20 },
    { A: 20, B: 30 }
  ];

  cy.createGrid({
    data: smallData,
    columns,
    bodyHeight: 400
  });

  cy.gridInstance().invoke('setValue', 0, 'C', 100);
  cy.getCell(0, 'C').should('have.text', '100');
});
