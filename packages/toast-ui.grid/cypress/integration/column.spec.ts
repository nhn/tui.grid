import { OptColumn } from '@/types';

export {};

type Address = [number, number];

function getRsideBody() {
  return cy.getByCls('rside-area', 'body-area');
}

function startEditingAt(rowInedx: number, columnIndex: number) {
  cy.gridInstance().invoke('startEditingAt', rowInedx, columnIndex);
}

function setColumns(columns: OptColumn[]) {
  cy.gridInstance().invoke('setColumns', columns);
}

function setSelection(start: Address, end: Address) {
  cy.gridInstance().invoke('setSelectionRange', { start, end });
}

const data = [
  { id: 1, name: 'Kim', score: 90, grade: 'A' },
  { id: 2, name: 'Lee', score: 80, grade: 'B' }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

describe('setColumns()', () => {
  beforeEach(() => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({ data, columns });
  });

  it('reset the columns', () => {
    const columns = [{ name: 'id' }, { name: 'score' }, { name: 'grade' }];
    setColumns(columns);

    getRsideBody().should('have.cellData', [['1', '90', 'A'], ['2', '80', 'B']]);
  });

  it('focus, editing layer is removed', () => {
    const columns = [
      { name: 'id', editor: 'text' },
      { name: 'score' },
      { name: 'grade', editor: 'text' }
    ];
    startEditingAt(0, 0);
    setColumns(columns);

    cy.getByCls('layer-focus').should('not.be.visible');
    cy.getByCls('layer-editing').should('not.be.visible');
  });

  it('selection layer is removed', () => {
    const columns = [
      { name: 'id', editor: 'text' },
      { name: 'score' },
      { name: 'grade', editor: 'text' }
    ];
    setSelection([0, 0], [1, 1]);
    setColumns(columns);

    cy.getByCls('layer-selection').should('not.be.visible');
  });
});

describe('API', () => {
  beforeEach(() => {
    const columns = [{ name: 'name' }, { name: 'score' }];
    cy.createGrid({ data, columns });
  });

  it('getColumnValues()', () => {
    cy.gridInstance()
      .invoke('getColumnValues', 'name')
      .should('eql', ['Kim', 'Lee']);
  });

  it('setColumnValues()', () => {
    cy.gridInstance().invoke('setColumnValues', 'name', 'Park');

    cy.getColumnCells('name').should('sameColumnData', 'Park');
  });

  it('getIndexOfColumn()', () => {
    ['name', 'score'].forEach((column, index) => {
      cy.gridInstance()
        .invoke('getIndexOfColumn', column)
        .should('eq', index);
    });
  });

  it('hideColumns(), showColumn()', () => {
    cy.gridInstance().invoke('hideColumn', 'name');

    cy.getHeaderCell('name').should('not.exist');

    cy.gridInstance().invoke('showColumn', 'name');

    cy.getHeaderCell('name').should('exist');
  });
});
