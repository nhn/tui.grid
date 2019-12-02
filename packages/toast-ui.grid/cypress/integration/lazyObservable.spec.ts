import { data } from '../../samples/basic';
import { lazyObserbableTestdata as treeData } from '../../samples/tree';
import { cls } from '@/helper/dom';
import { RowKey } from '@/store/types';

function assertToggleButtonExpanded(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).within(() => {
    cy.get(`.${cls('tree-extra-content')}`).should('have.class', cls('tree-button-expand'));
  });
}

function assertCheckedState(checked: boolean) {
  cy.get('input').should($el => {
    $el.each((_, elem) => {
      expect(elem.checked).eq(checked);
    });
  });
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  const columns = [
    { name: 'name', editor: 'text' },
    { name: 'artist', editor: 'text' },
    { name: 'type', editor: 'text' }
  ];

  cy.createGrid({ data, columns, rowHeaders: ['checkbox'], bodyHeight: 400 });
});

function scrollToBottom() {
  cy.get(`.${cls('lside-area')} .${cls('body-area')}`).scrollTo(0, 400);
}

describe('API test on lazy observable data', () => {
  it('focus / blur api', () => {
    cy.gridInstance().invoke('focus', 18, 'name');
    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { rowKey: 18, columnName: 'name', value: 'The Magic Whip' });

    cy.gridInstance().invoke('blur');
    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { rowKey: null, columnName: null, value: null });
  });

  it('startEditing api', () => {
    cy.gridInstance().invoke('startEditing', 18, 'name', 'Lee');
    cy.get(`.${cls('content-text')}`).type('Lee{enter}');

    cy.gridInstance()
      .invoke('getValue', 18, 'name')
      .should('eql', 'Lee');

    scrollToBottom();

    cy.getCell(18, 'name').contains('Lee');
  });

  it('finishEditing api', () => {
    cy.gridInstance().invoke('startEditing', 18, 'name');
    cy.gridInstance().invoke('finishEditing', 18, 'name', 'Kim');
    cy.gridInstance()
      .invoke('getValue', 18, 'name')
      .should('eql', 'Kim');

    scrollToBottom();

    cy.getCell(18, 'name').contains('Kim');
  });

  it('checkAll / uncheckAll api', () => {
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

  it('check / uncheck api', () => {
    cy.gridInstance().invoke('checkAll');
    cy.gridInstance()
      .invoke('getCheckedRowKeys')
      .should('have.length', 20);

    assertCheckedState(true);

    cy.gridInstance().invoke('uncheck', 18);

    scrollToBottom();

    cy.getCell(18, '_checked').within(() => {
      cy.get('input').should('be.not.checked');
    });

    cy.gridInstance().invoke('check', 18);

    assertCheckedState(true);
  });

  it('findRow api', () => {
    cy.gridInstance().invoke('startEditing', 18, 'name');
    cy.gridInstance().invoke('finishEditing', 18, 'name', 'Lee');
    cy.gridInstance()
      .invoke('findRows', { name: 'Lee' })
      .should('have.length', 1);
  });

  it('disable api', () => {
    cy.gridInstance().invoke('disable');

    scrollToBottom();

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
  });

  it('disableRowCheck / disableRow api', () => {
    cy.gridInstance().invoke('disableRow', 17);
    cy.gridInstance().invoke('disableRowCheck', 18);

    scrollToBottom();

    cy.getCell(17, 'name').should('have.class', `${cls('cell-disabled')}`);
    cy.getCell(17, 'artist').should('have.class', `${cls('cell-disabled')}`);
    cy.getCell(17, 'type').should('have.class', `${cls('cell-disabled')}`);

    cy.getCell(18, '_checked').within(() => {
      cy.get('input').should('have.attr', 'disabled');
    });
  });

  it('addCellClassName / removeCellClassName api', () => {
    cy.gridInstance().invoke('addCellClassName', 17, 'name', 'tui-grid-cell-test');
    cy.gridInstance().invoke('removeCellClassName', 17, 'name', 'tui-grid-cell-test');
    cy.gridInstance().invoke('addCellClassName', 18, 'name', 'tui-grid-cell-test');

    scrollToBottom();

    cy.getCell(17, 'name').should('have.not.class', 'tui-grid-cell-test');
    cy.getCell(18, 'name').should('have.class', 'tui-grid-cell-test');
  });

  it('addRowClassName / removeRowClassName api', () => {
    cy.gridInstance().invoke('addRowClassName', 17, 'tui-grid-cell-test');
    cy.gridInstance().invoke('removeRowClassName', 17, 'tui-grid-cell-test');
    cy.gridInstance().invoke('addRowClassName', 18, 'tui-grid-cell-test');

    scrollToBottom();

    cy.getCell(17, 'name').should('have.not.class', 'tui-grid-cell-test');
    cy.getCell(17, 'artist').should('have.not.class', 'tui-grid-cell-test');
    cy.getCell(17, 'type').should('have.not.class', 'tui-grid-cell-test');

    cy.getCell(18, 'name').should('have.class', 'tui-grid-cell-test');
    cy.getCell(18, 'artist').should('have.class', 'tui-grid-cell-test');
    cy.getCell(18, 'type').should('have.class', 'tui-grid-cell-test');
  });

  it('appendRow api', () => {
    cy.gridInstance().invoke('appendRow', { name: 'Lee', artist: 'Lee', type: 'test' });
    cy.gridInstance()
      .invoke('getRowCount')
      .should('eq', 21);
    cy.gridInstance()
      .invoke('getRow', 20)
      .should(row => {
        expect(row).to.contain({ name: 'Lee', artist: 'Lee', type: 'test' });
      });

    cy.gridInstance().invoke('focus', 20, 'name', true);
    cy.getCell(20, 'name').should($el => {
      expect($el.text()).to.be.eq('Lee');
    });
  });

  it('resetData api', () => {
    cy.gridInstance().invoke('resetData', [{ name: 'Lee', artist: 'Lee', type: 'test' }]);
    cy.gridInstance()
      .invoke('getRowCount')
      .should('eq', 1);
    cy.getCell(0, 'name').should($el => {
      expect($el.text()).to.be.eq('Lee');
    });
  });

  it('expandAll, focusAt api', () => {
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

    cy.gridInstance().invoke('expandAll');
    cy.gridInstance().invoke('focusAt', 16, 0, true);

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', { rowKey: 16, columnName: 'name', value: 'This Is Acting' });
    assertToggleButtonExpanded(12, 'name');
    assertToggleButtonExpanded(13, 'name');
    assertToggleButtonExpanded(14, 'name');
    assertToggleButtonExpanded(15, 'name');
  });
});
