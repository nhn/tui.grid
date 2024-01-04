import { clipboardType, editingLayerType } from '../helper/util';
import { assertFocusedCell, assertSelectedRange } from '../helper/assert';
import { GridOptions } from '@t/index';

// unable to test clipboard
// https://github.com/cypress-io/cypress/issues/2386
// https://github.com/cypress-io/cypress/issues/311

before(() => {
  cy.visit('/dist');
});

function assertEditFinished() {
  cy.getByCls('content-text').should('not.exist');
}

function createGrid(options?: Partial<GridOptions>) {
  const data = [
    { name: 'Han', value: 1, age: 23 },
    { name: 'Kim', value: 2, age: 28 },
    { name: 'Ryu', value: 3, age: 27 },
    { name: 'Lee', value: 4, age: 30 },
  ];

  const columns = [
    { name: 'name', editor: 'text' },
    { name: 'value', editor: 'text' },
  ];

  cy.createGrid({ data, columns, ...options });
}

describe('editor', () => {
  beforeEach(() => {
    createGrid();
  });

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

  ['backspace', 'del'].forEach((key) => {
    it(`delete focused content by pressing ${key}`, () => {
      cy.getCellByIdx(0, 0).click();
      clipboardType(`{${key}}`);

      cy.getCellByIdx(0, 0).should('have.text', '');
    });
  });
});

describe('Focus', () => {
  beforeEach(() => {
    createGrid();
  });

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

describe('Move focus on enter', () => {
  it('should not move the focus on enter(default)', () => {
    createGrid({
      columns: [
        { name: 'name', editor: 'text' },
        { name: 'value', editor: 'text' },
        { name: 'age' },
      ],
    });
    cy.getCellByIdx(0, 0).click();

    clipboardType('{enter}');

    assertFocusedCell('name', 0);
  });

  it('should move the focus to next cell on enter(nextCell)', () => {
    createGrid({
      columns: [
        { name: 'name', editor: 'text' },
        { name: 'value', editor: 'text' },
        { name: 'age' },
      ],
      moveDirectionOnEnter: 'nextCell',
    });
    cy.getCellByIdx(0, 0).click();

    clipboardType('{enter}');

    assertFocusedCell('name', 0);
    cy.getByCls('layer-editing').should('be.visible');

    editingLayerType('{enter}');

    assertFocusedCell('value', 0);
    cy.getByCls('layer-editing').should('be.visible');

    editingLayerType('{enter}');

    assertFocusedCell('age', 0);
    cy.getByCls('layer-editing').should('be.not.visible');

    clipboardType('{enter}');

    assertFocusedCell('name', 1);
    cy.getByCls('layer-editing').should('be.visible');
  });

  it('should move the focus to next cell on enter(prevCell)', () => {
    createGrid({
      columns: [
        { name: 'name', editor: 'text' },
        { name: 'value', editor: 'text' },
        { name: 'age' },
      ],
      moveDirectionOnEnter: 'prevCell',
    });
    cy.getCellByIdx(1, 0).click();

    clipboardType('{enter}');

    assertFocusedCell('name', 1);
    cy.getByCls('layer-editing').should('be.visible');

    editingLayerType('{enter}');

    assertFocusedCell('age', 0);
    cy.getByCls('layer-editing').should('be.not.visible');

    clipboardType('{enter}');

    assertFocusedCell('value', 0);
    cy.getByCls('layer-editing').should('be.visible');

    editingLayerType('{enter}');

    assertFocusedCell('name', 0);
    cy.getByCls('layer-editing').should('be.visible');
  });

  it('should move the focus to next cell on enter(down)', () => {
    createGrid({
      columns: [
        { name: 'name', editor: 'text' },
        { name: 'value', editor: 'text' },
        { name: 'age' },
      ],
      moveDirectionOnEnter: 'down',
    });
    cy.getCellByIdx(0, 0).click();

    clipboardType('{enter}');

    assertFocusedCell('name', 0);
    cy.getByCls('layer-editing').should('be.visible');

    editingLayerType('{enter}');

    assertFocusedCell('name', 1);
    cy.getByCls('layer-editing').should('be.visible');

    editingLayerType('{enter}');

    assertFocusedCell('name', 2);
    cy.getByCls('layer-editing').should('be.visible');
  });

  it('should move the focus to next cell on enter(up)', () => {
    createGrid({
      columns: [
        { name: 'name', editor: 'text' },
        { name: 'value', editor: 'text' },
        { name: 'age' },
      ],
      moveDirectionOnEnter: 'up',
    });
    cy.getCellByIdx(2, 0).click();

    clipboardType('{enter}');

    assertFocusedCell('name', 2);

    editingLayerType('{enter}');

    assertFocusedCell('name', 1);

    editingLayerType('{enter}');

    assertFocusedCell('name', 0);
  });

  it('should finish editing on last cell', () => {
    createGrid({
      columns: [
        { name: 'name', editor: 'text' },
        { name: 'value', editor: 'text' },
        { name: 'age', editor: 'text' },
      ],
      moveDirectionOnEnter: 'nextCell',
    });
    cy.getCellByIdx(3, 1).click();

    clipboardType('{enter}');
    editingLayerType('{enter}');

    assertFocusedCell('age', 3);
    cy.getByCls('layer-editing').should('be.visible');

    editingLayerType('{enter}');

    assertFocusedCell('age', 3);
    cy.getByCls('layer-editing').should('not.be.visible');
  });
});

describe('Selection', () => {
  it('select by pressing shift + arrowKey', () => {
    createGrid();

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
    createGrid();

    cy.getCellByIdx(0, 1).click();
    clipboardType('{shift}{home}');

    assertSelectedRange({ start: [0, 0], end: [0, 1] });
  });

  it('Select to the last cell of row based on focus  by pressing shift + end', () => {
    createGrid();

    cy.getCellByIdx(0, 0).click();
    clipboardType('{shift}{end}');

    assertSelectedRange({ start: [0, 0], end: [0, 1] });
  });

  it('Select to the first cell of column based on focus by pressing shift + pageup', () => {
    createGrid();

    cy.getCellByIdx(1, 1).click();
    clipboardType('{shift}{pageup}');

    assertSelectedRange({ start: [0, 1], end: [1, 1] });
  });

  it('Select to the last cell of column based on focus by pressing shift + pagedown', () => {
    createGrid();

    cy.getCellByIdx(1, 1).click();
    clipboardType('{shift}{pagedown}');

    assertSelectedRange({ start: [1, 1], end: [3, 1] });
  });

  it('Select to the first cell of first column based on focus by pressing cmd(ctrl) + shift + home', () => {
    createGrid();

    cy.getCellByIdx(1, 1).click();
    clipboardType('{ctrl}{shift}{home}');

    assertSelectedRange({ start: [0, 0], end: [1, 1] });
  });

  it('Select to the last cell of last column based on focus by pressing cmd(ctrl) + shift + end', () => {
    createGrid();

    cy.getCellByIdx(1, 1).click();
    clipboardType('{ctrl}{shift}{end}');

    assertSelectedRange({ start: [1, 1], end: [3, 1] });
  });

  describe('cmd(ctrl) + A', () => {
    it('should Select all cells', () => {
      createGrid();

      cy.getCellByIdx(1, 1).click();
      clipboardType('{ctrl}A');

      assertSelectedRange({ start: [0, 0], end: [3, 1] });
    });

    it('should select all cells after calling appendRows() API', () => {
      const data = [
        { name: 'Han', value: 1 },
        { name: 'Kim', value: 2 },
        { name: 'Ryu', value: 3 },
        { name: 'Lee', value: 4 },
      ];
      const columns = [
        { name: 'name', editor: 'text' },
        { name: 'value', editor: 'text' },
      ];

      cy.createGrid({ columns });

      cy.gridInstance().invoke('appendRows', data);
      cy.getCellByIdx(1, 1).click();
      clipboardType('{ctrl}A');

      assertSelectedRange({ start: [0, 0], end: [3, 1] });
    });
  });

  ['backspace', 'del'].forEach((key) => {
    it(`delete selection content by pressing ${key}`, () => {
      createGrid();

      const range = { start: [0, 0], end: [1, 1] };
      cy.gridInstance().invoke('setSelectionRange', range);
      clipboardType(`{${key}}`);

      cy.getRsideBody().should('have.cellData', [
        ['', ''],
        ['', ''],
        ['Ryu', '3'],
        ['Lee', '4'],
      ]);
    });
  });
});
