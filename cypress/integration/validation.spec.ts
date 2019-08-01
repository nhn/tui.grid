import { cls } from '../../src/helper/dom';
import { data } from '../../samples/basic';
import { isSubsetOf } from '../helper/compare';

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

describe('validate changed value', () => {
  it('empty', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'name', validation: { required: true } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'name', '');
    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
  });

  it('data type is string', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'name', validation: { dataType: 'string' } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'name', 123);
    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
  });

  it('data type is number', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'price', validation: { dataType: 'number' } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'price', 'test');
    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });
});

describe('validate changed value using editor', () => {
  it('empty', () => {
    cy.createGrid({
      data: data.slice(2),
      columns: [{ name: 'name', editor: 'text', validation: { required: true } }]
    });

    cy.getCell(0, 'name')
      .trigger('mousedown')
      .trigger('dblclick');

    cy.get(`.${cls('layer-editing')} input`)
      .invoke('val', '')
      .type('{enter}');
    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
  });

  it('data type is number', () => {
    cy.createGrid({
      data: data.slice(2),
      columns: [{ name: 'price', editor: 'text', validation: { dataType: 'number' } }]
    });

    cy.getCell(0, 'price')
      .trigger('mousedown')
      .trigger('dblclick');

    cy.get(`.${cls('layer-editing')} input`).type('foo{enter}');
    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });
});

describe('get data that failed validation result by validate api', () => {
  it('empty', () => {
    cy.createGrid({
      data: data.slice(2),
      columns: [{ name: 'name', editor: 'text', validation: { required: true } }]
    });

    cy.getCell(0, 'name')
      .trigger('mousedown')
      .trigger('dblclick');

    cy.get(`.${cls('layer-editing')} input`)
      .invoke('val', '')
      .type('{enter}');

    cy.gridInstance()
      .invoke('validate')
      .should(result => {
        expect(
          isSubsetOf(
            [{ errors: [{ columnName: 'name', errorCode: 'REQUIRED' }], rowKey: 0 }],
            result
          )
        ).to.be.true;
      });
  });
});
