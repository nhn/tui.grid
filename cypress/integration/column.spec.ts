import { cls } from '@/helper/dom';

export {};

const data = [
  { id: 1, name: 'Kim', score: 90, grade: 'A' },
  { id: 2, name: 'Lee', score: 80, grade: 'B' }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

function assertRowText(rowIdx: number, cellTexts: string[]) {
  cellTexts.forEach((text, columnIdx) => {
    cy.getCellByIdx(rowIdx, columnIdx).should('to.have.text', text);
  });
}

describe('setColumns()', () => {
  it('resets the column data', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({ data, columns });

    cy.gridInstance().invoke('setColumns', [{ name: 'id' }, { name: 'score' }, { name: 'grade' }]);

    assertRowText(0, ['1', '90', 'A']);
    assertRowText(1, ['2', '80', 'B']);
  });
});

describe('getIndexOfColumn()', () => {
  it('returns the index of column having given columnName', () => {
    const columns = [{ name: 'id' }, { name: 'name' }, { name: 'age' }];
    cy.createGrid({ data, columns });

    cy.gridInstance()
      .invoke('getIndexOfColumn', 'name')
      .should('eq', 1);

    cy.gridInstance()
      .invoke('getIndexOfColumn', 'age')
      .should('eq', 2);
  });
});

describe('setHeader()', () => {
  it('change height', () => {
    const cellBorderWidth = 1;
    const height = 300;
    const columns = [{ name: 'id' }, { name: 'name' }, { name: 'age' }];
    cy.createGrid({ data, columns });

    cy.gridInstance().invoke('setHeader', { height });
    cy.get(`.${cls('cell-header')}`).each(($header) => {
      expect($header.height()).to.eq(height - cellBorderWidth * 2);
    });
  });

  it('change complexColumns', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        complexColumns: [
          {
            header: 'info',
            name: 'mergeColumn1',
            childNames: ['id', 'name']
          }
        ]
      }
    });

    cy.get('[data-column-name=mergeColumn1]').should('have.text', 'info');

    cy.gridInstance().invoke('setHeader', {
      complexColumns: [
        {
          header: 'information',
          name: 'mergeColumn1',
          childNames: ['id', 'name']
        }
      ]
    });

    cy.get('[data-column-name=mergeColumn1]').should('have.text', 'information');
  });
});

describe.only('setColumnTitles()', () => {
  it('change column titles', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];

    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        complexColumns: [
          {
            header: 'info',
            name: 'mergeColumn1',
            childNames: ['id', 'name']
          }
        ]
      }
    });

    cy.gridInstance().invoke('setColumnTitles', {
      id: '_id',
      name: '_name',
      mergeColumn1: '_info'
    });

    cy.get('[data-column-name=id]')
      .eq(0)
      .should('have.text', '_id');

    cy.get('[data-column-name=name]')
      .eq(0)
      .should('have.text', '_name');

    cy.get('[data-column-name=mergeColumn1]').should('have.text', '_info');
  });
});
