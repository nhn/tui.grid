import { cls } from '../../src/helper/dom';
import { data, columns } from '../../samples/relations';

function assertRelation() {
  cy.gridInstance().invoke('setValue', 0, 'category1', '02');
  cy.gridInstance().invoke('setValue', 0, 'category2', '02_01');

  cy.getCell(0, 'category2').should('have.text', 'Pop');
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.createGrid({ data, columns });
});

it('should change state by relations', () => {
  assertRelation();
});

it('change cell disabled state with empty value', () => {
  cy.gridInstance().invoke('setValue', 1, 'category1', '');

  cy.getCell(1, 'category2').should('have.class', `${cls('cell-disabled')}`);
  cy.getCell(1, 'category3').should('have.class', `${cls('cell-disabled')}`);
});

it('change cell editable state', () => {
  cy.gridInstance().invoke('setValue', 1, 'category1', '01');

  cy.getCell(1, 'category2').should('have.not.class', `${cls('cell-editable')}`);
});

it('set relation columns through setColumns()', () => {
  cy.gridInstance().invoke('setColumns', columns.slice(0, 3));

  assertRelation();
});
