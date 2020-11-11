import { OptColumn } from '@t/options';
import { setSelectionUsingMouse } from '../helper/util';

const columns: OptColumn[] = [
  { name: 'A', minWidth: 150 },
  { name: 'B', minWidth: 150 },
];
const data = [
  { A: 1, B: 2 },
  { A: 3, B: 2 },
  { A: 4, B: 2 },
];

before(() => {
  cy.visit('/dist');
});

describe('getSelectionRange', () => {
  ['API', 'UI'].forEach((type) => {
    it(`selection by ${type}`, () => {
      cy.createGrid({ data, columns });
      const range = { start: [0, 0], end: [1, 1] };
      if (type === 'API') {
        cy.gridInstance().invoke('setSelectionRange', range);
      } else {
        setSelectionUsingMouse([0, 0], [1, 1]);
      }

      cy.gridInstance().invoke('getSelectionRange').should('eql', range);
    });
  });

  it('select column by clicking header', () => {
    cy.createGrid({ data, columns });
    cy.get('th[data-column-name=A]').eq(0).click();

    cy.gridInstance()
      .invoke('getSelectionRange')
      .should('eql', { start: [0, 0], end: [2, 0] });
  });

  it('select row by clicking row header', () => {
    cy.createGrid({ data, columns, rowHeaders: ['rowNum'] });

    cy.getRowHeaderCell(0, '_number').click();

    cy.gridInstance()
      .invoke('getSelectionRange')
      .should('eql', { start: [0, 0], end: [0, 1] });
  });

  it('select column by clicking complex header', () => {
    cy.createGrid({
      data,
      columns,
      header: { height: 60, complexColumns: [{ header: 'C', name: 'C', childNames: ['A', 'B'] }] },
    });

    cy.get('th[data-column-name=C]').eq(0).click();

    cy.gridInstance()
      .invoke('getSelectionRange')
      .should('eql', { start: [0, 0], end: [2, 1] });
  });
});
