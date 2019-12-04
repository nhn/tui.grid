import { Range } from '@/store/types';

// unable to test clipboard
// https://github.com/cypress-io/cypress/issues/2386
// https://github.com/cypress-io/cypress/issues/311

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  const data = [
    { name: 'Han', value: 1 },
    { name: 'Kim', value: 2 },
    { name: 'Ryu', value: 3 },
    { name: 'Lee', value: 4 }
  ];

  const columns = [
    { name: 'name', editor: 'text' },
    { name: 'value', editor: 'text' }
  ];

  cy.createGrid({ data, columns });
});

function assertEditFinished() {
  cy.getByCls('content-text').should('not.exist');
}

function clipboardType(key: string) {
  cy.getByCls('clipboard').type(key);
}

function assertFocusedCell(columnName: string, rowKey: number) {
  cy.gridInstance()
    .invoke('getFocusedCell')
    .should('have.subset', { columnName, rowKey });
}

function assertSelectedRange(range: { start: Range; end: Range }) {
  cy.gridInstance()
    .invoke('getSelectionRange')
    .should('be.eql', range);
}

describe('editor', () => {
  it('start and finish editing by pressing enter', () => {
    cy.getCellByIdx(1, 0).click();
    clipboardType('{enter}');

    cy.getByCls('content-text').should('exist');

    cy.getByCls('content-text').type('test{enter}');

    cy.getCellByIdx(1, 0).should('have.text', 'test');
    assertEditFinished();
  });

  it('Stop editing by pressing esc', () => {
    cy.gridInstance().invoke('startEditing', 0, 'name');

    cy.getByCls('content-text').type('test{esc}');

    cy.getCellByIdx(0, 0).should('not.have.text', 'test');
    assertEditFinished();
  });

  ['backspace', 'del'].forEach(key => {
    it(`delete content by pressing ${key}`, () => {
      cy.getCellByIdx(0, 0).click();
      clipboardType(`{${key}}`);

      cy.getCellByIdx(0, 0).should('have.text', '');
    });
  });
});

describe('Focus', () => {
  it('Move by pressing arrow key', () => {
    cy.getCellByIdx(1, 0).click();
    clipboardType('{rightarrow}');

    assertFocusedCell('value', 1);

    clipboardType('{uparrow}');

    assertFocusedCell('value', 0);

    clipboardType('{leftarrow}');

    assertFocusedCell('name', 0);

    clipboardType('{downarrow}');

    assertFocusedCell('name', 1);
  });

  it('Move to the first cell in row by pressing home key', () => {
    cy.getCellByIdx(0, 1).click();
    clipboardType('{home}');

    assertFocusedCell('name', 0);
  });

  it('Move to the last cell in row by pressing end key', () => {
    cy.getCellByIdx(0, 0).click();
    clipboardType('{end}');

    assertFocusedCell('value', 0);
  });

  it('Move to the previous page cell in column by pressing pageup key', () => {
    cy.getCellByIdx(1, 0).click();
    clipboardType('{pageup}');

    assertFocusedCell('name', 0);
  });

  it('Move to the next page cell in column by pressing pagedown key', () => {
    cy.getCellByIdx(1, 0).click();
    clipboardType('{pagedown}');

    assertFocusedCell('name', 3);
  });

  it('Move to the first cell of the first column by pressing ctrl + home', () => {
    cy.getCellByIdx(1, 1).click();
    clipboardType('{ctrl}{home}');

    assertFocusedCell('name', 0);
  });

  it('Move to the last cell of the last column by pressing ctrl + end', () => {
    cy.getCellByIdx(1, 1).click();
    clipboardType('{ctrl}{end}');

    assertFocusedCell('value', 3);
  });
});

describe('Selection', () => {
  it('select by pressing shift + arrowKey', () => {
    cy.getCellByIdx(1, 0).click();
    clipboardType('{shift}{rightarrow}');

    assertSelectedRange({ start: [1, 0], end: [1, 1] });

    clipboardType('{shift}{uparrow}');

    assertSelectedRange({ start: [0, 0], end: [1, 1] });

    clipboardType('{shift}{downarrow}');

    assertSelectedRange({ start: [1, 0], end: [1, 1] });

    clipboardType('{shift}{leftarrow}');

    assertSelectedRange({ start: [1, 0], end: [1, 0] });
  });

  it('Select to the first cell of row based on focus by pressing shift + home', () => {
    cy.getCellByIdx(0, 1).click();
    clipboardType('{shift}{home}');

    assertSelectedRange({ start: [0, 0], end: [0, 1] });
  });

  it('Select to the last cell of row based on focus  by pressing shift + end', () => {
    cy.getCellByIdx(0, 0).click();
    clipboardType('{shift}{end}');

    assertSelectedRange({ start: [0, 0], end: [0, 1] });
  });

  it('Select to the first cell of column based on focus by pressing shift + pageup', () => {
    cy.getCellByIdx(1, 1).click();
    clipboardType('{shift}{pageup}');

    assertSelectedRange({ start: [0, 1], end: [1, 1] });
  });

  it('Select to the last cell of column based on focus by pressing shift + pagedown', () => {
    cy.getCellByIdx(1, 1).click();
    clipboardType('{shift}{pagedown}');

    assertSelectedRange({ start: [1, 1], end: [3, 1] });
  });

  it('Select to the first cell of first column based on focus by pressing cmd(ctrl) + shift + home', () => {
    cy.getCellByIdx(1, 1).click();
    clipboardType('{ctrl}{shift}{home}');

    assertSelectedRange({ start: [0, 0], end: [1, 1] });
  });

  it('Select to the last cell of last column based on focus by pressing cmd(ctrl) + shift + end', () => {
    cy.getCellByIdx(1, 1).click();
    clipboardType('{ctrl}{shift}{end}');

    assertSelectedRange({ start: [1, 1], end: [3, 1] });
  });

  it('Select all cells by pressing cmd(ctrl) + A', () => {
    cy.getCellByIdx(1, 1).click();
    clipboardType('{ctrl}A');

    assertSelectedRange({ start: [0, 0], end: [3, 1] });
  });
});
