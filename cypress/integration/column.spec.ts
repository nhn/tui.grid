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
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

describe('setColumns()', () => {
  it('resets the column data', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({
      data,
      columns
    });

    cy.gridInstance().invoke('setColumns', [{ name: 'id' }, { name: 'score' }, { name: 'grade' }]);

    cy.getCellContent(0, 'id').should('have.text', '1');
    cy.getCellContent(0, 'score').should('have.text', '90');
    cy.getCellContent(0, 'grade').should('have.text', 'A');
    cy.getCellContent(1, 'id').should('have.text', '2');
    cy.getCellContent(1, 'score').should('have.text', '80');
    cy.getCellContent(1, 'grade').should('have.text', 'B');
  });
});

describe('header align', () => {
  it('resets the column data', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        align: 'left',
        valign: 'top',
        columns: [{ name: 'grade', valign: 'bottom' }]
      }
    });

    cy.get('[data-column-name=id]')
      .eq(0)
      .should('have.css', 'vertical-align', 'top')
      .and('have.css', 'text-align', 'left');

    cy.get('[data-column-name=name]')
      .eq(0)
      .should('have.css', 'vertical-align', 'top')
      .and('have.css', 'text-align', 'left');

    cy.gridInstance().invoke('setColumns', [{ name: 'id' }, { name: 'score' }, { name: 'grade' }]);
    cy.get('[data-column-name=grade]')
      .eq(0)
      .should('have.css', 'vertical-align', 'bottom')
      .and('have.css', 'text-align', 'left');
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
    const paddingHorizontal = 8;
    const columns = [{ name: 'id' }, { name: 'name' }, { name: 'age' }];
    cy.createGrid({ data, columns });

    cy.gridInstance().invoke('setHeader', { height });
    cy.get(`.${cls('cell-header')}`).should($headers => {
      $headers.each((_, $header) => {
        expect(Cypress.$($header).height()).to.eq(height - cellBorderWidth - paddingHorizontal);
      });
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

describe('setColumnHeaders()', () => {
  it('change column headers', () => {
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

    cy.gridInstance().invoke('setColumnHeaders', {
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
