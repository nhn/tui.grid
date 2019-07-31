import { cls } from '../../src/helper/dom';
import { data, columns } from '../../samples/relations';

function assertRelation() {
  cy.gridInstance().invoke('finishEditing', 0, 'category1', '01');
  cy.gridInstance().invoke('finishEditing', 0, 'category2', '01_01');

  cy.getCell(0, 'category2').contains('Balad/Dance/Pop');
}

function addEditableRelation() {
  delete columns[0].relations![0].disabled;
  delete columns[1].relations![0].disabled;
  columns[0].relations![0].editable = ({ value }) => {
    return !!value;
  };
  columns[1].relations![0].editable = ({ value }) => {
    return !!value;
  };
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({ data, columns });
});

it('should change state by relations', () => {
  assertRelation();
});

it('change cell disabled state', () => {
  cy.gridInstance().invoke('finishEditing', 1, 'category1', '');

  cy.gridInstance().invoke('startEditing', 1, 'category2');
  cy.getCell(1, 'category2').should('have.class', `${cls('cell-disabled')}`);
  cy.get(`.${cls('layer-editing')}`).should('not.be.visible');

  cy.gridInstance().invoke('startEditing', 1, 'category2');
  cy.getCell(1, 'category3').should('have.class', `${cls('cell-disabled')}`);
  cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
});

it('change cell editable state', () => {
  addEditableRelation();
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({ data, columns });

  cy.gridInstance().invoke('finishEditing', 1, 'category1', '');

  cy.gridInstance().invoke('startEditing', 1, 'category2');
  cy.getCell(1, 'category2').should('have.not.class', `${cls('cell-editable')}`);
  cy.get(`.${cls('layer-editing')}`).should('not.be.visible');

  cy.gridInstance().invoke('startEditing', 1, 'category2');
  cy.getCell(1, 'category3').should('have.not.class', `${cls('cell-editable')}`);
  cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
});

it('set relation columns through setColumns()', () => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
  cy.createGrid({
    data,
    columns: [{ header: 'name', name: 'name' }]
  });
  cy.gridInstance().invoke('setColumns', columns);
  assertRelation();
});
