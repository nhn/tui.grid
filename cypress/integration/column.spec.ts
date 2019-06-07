import { cls } from '@/helper/dom';
import { OptRow } from '@/types';

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

describe('setColumns()', () => {
  it('resets the column data', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({ data, columns });

    cy.gridInstance().invoke('setColumns', [{ name: 'id' }, { name: 'score' }, { grade: 30 }]);

    cy.getCellByIdx(2, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(2, 1).should('to.have.text', '30');
  });

  it('if at option exist, insert a jrow at the given index', () => {
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 }, { at: 1 });

    cy.getCellByIdx(1, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(1, 1).should('to.have.text', '30');
    cy.getCellByIdx(2, 0).should('to.have.text', 'Lee');
    cy.getCellByIdx(2, 1).should('to.have.text', '20');
  });
});

describe('columns', () => {
  it('getIndexOfColumn() returns the index of column having given columnName', () => {
    cy.gridInstance()
      .invoke('getIndexOfColumn', 'name')
      .should('eq', 0);

    cy.gridInstance()
      .invoke('getIndexOfColumn', 'age')
      .should('eq', 1);
  });
});
