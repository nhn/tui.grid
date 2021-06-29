import { RowKey } from '@t/store/data';
import { MenuItem } from '@t/store/contextMenu';
import i18n from '@/i18n';
import { cls } from '@/helper/dom';

before(() => {
  cy.visit('/dist');
});

function createGridWithContextMenu(contextMenu?: MenuItem[][]) {
  i18n.setLanguage('en');

  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
    { name: 'Ryu', age: 22 },
  ];
  const columns = [{ name: 'name' }, { name: 'age' }];

  cy.createGrid({ data, columns, contextMenu });
}

function assertMenuItemByText(text: string) {
  return cy.get(`.${cls('context-menu')} .menu-item`).should('contain', text);
}

function showContextMenu(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).trigger('contextmenu');
}

function getMenuItemByText(text: string) {
  return cy.contains(`.${cls('context-menu')} .menu-item`, text);
}

describe('context menu', () => {
  it('should display default context menus when contextmenu event is triggered', () => {
    createGridWithContextMenu();

    showContextMenu(0, 'name');

    assertMenuItemByText(i18n.get('contextMenu.copy'));
    assertMenuItemByText(i18n.get('contextMenu.copyRows'));
    assertMenuItemByText(i18n.get('contextMenu.copyColumns'));
  });

  it('should display custom context menu when contextmenu event is triggered', () => {
    const contextMenu = [[{ name: 'menu1', label: 'text1' }], [{ name: 'menu2', label: 'text2' }]];

    createGridWithContextMenu(contextMenu);

    showContextMenu(0, 'name');

    assertMenuItemByText('text1');
    assertMenuItemByText('text2');
  });

  it('should executing the action with cell info(rowKey, columnName) when contextmenu item is clicked', () => {
    const stub = cy.stub();
    const rowKey = 0;
    const columnName = 'name';

    const contextMenu = [
      [{ name: 'menu1', label: 'text1' }],
      [{ name: 'menu2', label: 'text2', action: stub }],
    ];

    createGridWithContextMenu(contextMenu);

    showContextMenu(rowKey, columnName);
    getMenuItemByText('text2').click();

    cy.wrap(stub).should('be.calledWithExactly', { rowKey, columnName });
  });

  it('should executing the disabled with cell info(rowKey, columnName) when contextmenu item is displayed', () => {
    const disabledStub = cy.stub().returns(true);
    const actionStub = cy.stub();
    const rowKey = 0;
    const columnName = 'name';

    const contextMenu = [
      [{ name: 'menu1', label: 'text1' }],
      [{ name: 'menu2', label: 'text2', action: actionStub, disabled: disabledStub }],
    ];

    createGridWithContextMenu(contextMenu);

    showContextMenu(rowKey, columnName);
    getMenuItemByText('text2').click();

    getMenuItemByText('text2').should('have.class', 'disabled');
    cy.wrap(disabledStub).should('be.calledWithExactly', { rowKey, columnName });
    cy.wrap(actionStub).should('be.not.called');
  });

  it('should display sub menu when mouseenter is triggered on menu item', () => {
    const contextMenu = [
      [{ name: 'menu1', label: 'text1' }],
      [{ name: 'menu2', label: 'text2', subMenu: [{ name: 'subMenu1', label: 'subMenu1' }] }],
    ];

    createGridWithContextMenu(contextMenu);

    showContextMenu(0, 'name');
    getMenuItemByText('text2').trigger('mouseenter');

    assertMenuItemByText('subMenu1');
  });

  it('should apply classNames option to context menu', () => {
    const contextMenu = [[{ name: 'menu1', label: 'text1', classNames: ['myClass'] }]];

    createGridWithContextMenu(contextMenu);

    showContextMenu(0, 'name');

    getMenuItemByText('text1').should('have.class', 'myClass');
  });

  it('should apply label option as html to context menu', () => {
    const contextMenu = [[{ name: 'menu1', label: '<em>emphasis</em>' }]];

    createGridWithContextMenu(contextMenu);

    showContextMenu(0, 'name');

    getMenuItemByText('emphasis').should('have.html', '<span><em>emphasis</em></span>');
  });

  it('should copy the focused cell text when default `Copy` menu is clicked', () => {
    const rowKey = 0;
    const columnName = 'name';

    createGridWithContextMenu();

    cy.gridInstance().invoke('focus', rowKey, columnName);
    showContextMenu(rowKey, columnName);

    getMenuItemByText(i18n.get('contextMenu.copy')).click();

    // bypassing the clipboard test using our own clipboard element.
    cy.getByCls('clipboard').should('have.text', 'Lee');
  });

  it('should copy the columns when default `Copy Columns` menu is clicked', () => {
    const rowKey = 0;
    const columnName = 'name';

    createGridWithContextMenu();

    cy.gridInstance().invoke('focus', rowKey, columnName);
    showContextMenu(rowKey, columnName);

    getMenuItemByText(i18n.get('contextMenu.copyColumns')).click();

    // bypassing the clipboard test using our own clipboard element.
    cy.getByCls('clipboard').should('have.text', 'Lee\nHan\nRyu');
  });

  it('should copy the rows when default `Copy Rows` menu is clicked', () => {
    const rowKey = 0;
    const columnName = 'name';

    createGridWithContextMenu();

    cy.gridInstance().invoke('focus', rowKey, columnName);
    showContextMenu(rowKey, columnName);

    getMenuItemByText(i18n.get('contextMenu.copyRows')).click();

    // bypassing the clipboard test using our own clipboard element.
    cy.getByCls('clipboard').should('have.text', 'Lee\t20');
  });
});
