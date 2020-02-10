import { cls } from '../../src/helper/dom';

before(() => {
  cy.visit('/dist');
});

const data = [
  { name: 'note', price: 10000 },
  { name: 'pen', price: 4000 }
];

it('should check the validation of cell - required', () => {
  cy.createGrid({
    data,
    columns: [{ name: 'name', validation: { required: true } }]
  });

  cy.gridInstance().invoke('setValue', 0, 'name', '');

  cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
});

it('should check the validation of cell - regExp', () => {
  cy.createGrid({
    data,
    columns: [{ name: 'name', validation: { regExp: /[0-9]+:[0-9]/ } }]
  });

  cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));

  cy.gridInstance().invoke('setValue', 0, 'name', '9:9');

  cy.getCell(0, 'name').should('not.have.class', cls('cell-invalid'));
});

describe('should check the validation of cell - dataType: string', () => {
  it('check `string` type validation', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'name', validation: { dataType: 'string' } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'name', 123);

    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
  });

  it('min and max work if the value is a string type number.', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'price', validation: { dataType: 'string', min: 10, max: 20 } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'price', '21');

    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });
});

describe('should check the validation of cell - dataType: number', () => {
  it('check `number` type validation', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'price', validation: { dataType: 'number' } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'price', 'test');

    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });

  it('check `min` value validation', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'price', validation: { dataType: 'number', min: 10 } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'price', 0);

    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });

  it('check `max` value validation', () => {
    cy.createGrid({
      data,
      columns: [{ name: 'price', validation: { dataType: 'number', max: 20 } }]
    });

    cy.gridInstance().invoke('setValue', 0, 'price', 25);

    cy.getCell(0, 'price').should('have.class', cls('cell-invalid'));
  });
});

describe('should check the validation of cell - validatorFn', () => {
  it('check `validatorFn` validation', () => {
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

  it.only('`value`, `rowKey`, `columnName` should be passed as the parameters of validatorFn ', () => {
    const callback = cy.stub();

    cy.createGrid({
      data,
      columns: [
        {
          name: 'name',
          validation: {
            validatorFn: callback
          }
        }
      ]
    });

    cy.wrap(callback).should('be.calledWithMatch', 'note', { rowKey: 0, name: 'note' }, 'name');
    cy.wrap(callback).should('be.calledWithMatch', 'pen', 1, { rowKey: 1, name: 'pen' }, 'name');
  });
});

it('should check the validation of cell - combined', () => {
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

it('should check the validation of cell after editing', () => {
  cy.createGrid({
    data,
    columns: [{ name: 'name', editor: 'text', validation: { required: true } }]
  });

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.getByCls('content-text').invoke('val', '');
  cy.gridInstance().invoke('finishEditing');

  cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
});

it('get failed validation result by validate api', () => {
  cy.createGrid({
    data,
    columns: [{ name: 'name', editor: 'text', validation: { required: true } }]
  });

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.getByCls('content-text').invoke('val', '');
  cy.gridInstance().invoke('finishEditing');

  cy.gridInstance()
    .invoke('validate')
    .should('eql', [{ errors: [{ columnName: 'name', errorCode: ['REQUIRED'] }], rowKey: 0 }]);
});

it('validate changed value after calling resetData API', () => {
  cy.createGrid({
    data: [],
    columns: [{ name: 'name', editor: 'text', validation: { required: true } }]
  });
  cy.gridInstance().invoke('resetData', [{ name: '' }]);

  cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
});

it('validate changed value after calling setColumns API', () => {
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
