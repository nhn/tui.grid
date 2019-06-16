import { cls } from '../../src/helper/dom';
import { data, columns } from '../../samples/relations';

function assertRelation() {
  cy.get(`.${cls('container')}`).as('container');

  cy.get('@container')
    .trigger('mousedown', 10, 60)
    .trigger('dblclick', 10, 60);

  cy.get(`.${cls('layer-editing')} select`).select('01');
  cy.get('@container')
    .trigger('mousedown', 250, 60)
    .trigger('dblclick', 250, 60);

  cy.get(`.${cls('layer-editing')} select`)
    .select('Balad/Dance/Pop')
    .should('have.value', '01_01');
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({ data, columns });
});

// @TODO add more test and data
it('should change state by relations', () => {
  assertRelation();
});

it('set relation columns through setColumns()', () => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({
    data,
    columns: [{ header: 'name', name: 'name' }]
  });
  cy.gridInstance().invoke('setColumns', columns);
  assertRelation();
});
