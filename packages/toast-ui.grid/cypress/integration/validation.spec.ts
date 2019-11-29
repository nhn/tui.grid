import { cls } from '../../src/helper/dom';
import { data } from '../../samples/basic';

before(() => {
  cy.visit('/dist');
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

  it('value is greater than min value', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'price', validation: { dataType: 'number', min: 10 } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'price', 0);
    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });

  it('value is greater than max value', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'price', validation: { dataType: 'number', max: 20 } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'price', 25);
    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });

  it('min and max only work if the value is a number.', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'price', validation: { dataType: 'number', max: 20 } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'price', 'not number');
    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });

  it('value is meet regExp', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'name', validation: { regExp: /[0-9]+:[0-9]/ } }]
    });

    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
    cy.gridInstance().invoke('setValue', 0, 'name', '9:9');
    cy.getCell(0, 'name').should('not.have.class', cls('cell-invalid'));
  });

  it('value is meet validatorFn', () => {
    cy.createGrid({
      data,
      columns: [
        {
          name: 'name',
          validation: {
            validatorFn: (value: number) => value > 20 && value < 30
          }
        }
      ]
    });

    cy.gridInstance().invoke('setValue', 0, 'name', 19);
    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
  });

  it('value is meet all condition', () => {
    cy.createGrid({
      data,
      columns: [
        {
          name: 'price',
          validation: {
            min: 10,
            max: 30,
            validatorFn: (value: number) => value !== 25
          }
        }
      ]
    });

    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
    cy.gridInstance().invoke('setValue', 0, 'price', 27);
    cy.getCell(0, 'price').should('not.have.class', cls('cell-invalid'));
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
        expect(result).to.include.deep.members([
          { errors: [{ columnName: 'name', errorCode: ['REQUIRED'] }], rowKey: 0 }
        ]);
      });
  });
});

it('validate changed value using editor by resetData API', () => {
  cy.createGrid({
    data: [],
    columns: [{ name: 'name', editor: 'text', validation: { required: true } }]
  });
  cy.gridInstance().invoke('resetData', [{ name: '' }]);
  cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
});

it('validate changed value using editor by setColumns API', () => {
  const columns = [
    { name: 'name', editor: 'text' },
    { name: 'price', editor: 'text' }
  ];
  const columnsWithValidation = columns.map(column => ({
    ...column,
    validation: { required: true }
  }));

  cy.createGrid({ data: [{ name: 'name', price: '' }], columns });
  cy.gridInstance().invoke('setColumns', columnsWithValidation);
  cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
});
