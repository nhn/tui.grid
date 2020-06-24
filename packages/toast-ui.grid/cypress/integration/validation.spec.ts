import { cls } from '../../src/helper/dom';
import Grid from '@t/index';

before(() => {
  cy.visit('/dist');
});

interface WindowWithGrid extends Window {
  grid?: Grid;
}

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

  it('`value`, `row`, `columnName` should be passed as the parameters of validatorFn ', () => {
    const stub = cy.stub();

    cy.createGrid({
      data,
      columns: [
        {
          name: 'name',
          validation: {
            validatorFn: stub
          }
        }
      ]
    });

    cy.wrap(stub).should('be.calledWithMatch', 'note', { rowKey: 0, name: 'note' }, 'name');
    cy.wrap(stub).should('be.calledWithMatch', 'pen', { rowKey: 1, name: 'pen' }, 'name');
  });

  it('should execute `validatorFn` as unobserved function', () => {
    const stub = cy.stub();
    cy.window().then((win: WindowWithGrid) => {
      cy.createGrid({
        data,
        columns: [
          {
            name: 'name',
            validation: {
              validatorFn: () => {
                if (win.grid) {
                  stub();
                }
              }
            }
          }
        ]
      });

      cy.gridInstance().invoke('appendRow', {});

      cy.wrap(stub).should('be.calledOnce');
    });
  });

  it('should execute `validatorFn` with applying changed data', () => {
    const stub = cy.stub();
    cy.window().then((win: WindowWithGrid) => {
      cy.createGrid({
        data,
        columns: [
          {
            name: 'name',
            validation: {
              validatorFn: () => {
                if (win.grid) {
                  stub(win.grid.getColumnValues('name'));
                }
              }
            }
          }
        ]
      });

      cy.gridInstance().invoke('appendRow', { name: 'pencil', price: 100 });

      cy.wrap(stub).should('be.calledWithMatch', ['note', 'pen', 'pencil']);

      cy.gridInstance().invoke('setRow', 0, { name: 'eraser', price: 2000 });

      cy.wrap(stub).should('be.calledWithMatch', ['eraser', 'pen', 'pencil']);
    });
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

describe('should check the validation of cell - unique', () => {
  beforeEach(() => {
    const duplicateData = [
      { name: 'pen', price: 2000 },
      { name: 'note', price: 10000 },
      { name: 'note', price: 4000 }
    ];
    cy.createGrid({
      data: duplicateData,
      columns: [
        {
          name: 'name',
          editor: 'text',
          validation: {
            unique: true
          }
        },
        {
          name: 'price',
          validation: {
            unique: true
          }
        }
      ],
      rowHeaders: ['checkbox']
    });
  });

  it('check `unique` validation on initial rendering', () => {
    cy.getCell(0, 'name').should('not.have.class', cls('cell-invalid'));
    cy.getCell(1, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('have.class', cls('cell-invalid'));
  });

  it('check `unique` validation after calling appendRow', () => {
    cy.gridInstance().invoke('appendRow', { name: 'pen', price: 3000 });

    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(1, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(3, 'name').should('have.class', cls('cell-invalid'));
  });

  it('check `unique` validation after calling appendRows', () => {
    cy.gridInstance().invoke('appendRows', [
      { name: 'pen', price: 100 },
      { name: 'eraser', price: 3200 }
    ]);

    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(1, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(3, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(4, 'name').should('not.have.class', cls('cell-invalid'));
  });

  it('check `unique` validation after calling appendRows', () => {
    cy.gridInstance().invoke('appendRows', [
      { name: 'pen', price: 100 },
      { name: 'eraser', price: 3200 }
    ]);

    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(1, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(3, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(4, 'name').should('not.have.class', cls('cell-invalid'));
  });

  it('check `unique` validation after calling setColumnValues', () => {
    cy.gridInstance().invoke('setColumnValues', 'name', 'eraser');

    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(1, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('have.class', cls('cell-invalid'));
  });

  it('check `unique` validation after calling removeRow', () => {
    cy.gridInstance().invoke('removeRow', 1);

    cy.getCell(0, 'name').should('not.have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('not.have.class', cls('cell-invalid'));
  });

  it('check `unique` validation after calling removeCheckedRows', () => {
    cy.gridInstance().invoke('check', 1);
    cy.gridInstance().invoke('removeCheckedRows');

    cy.getCell(0, 'name').should('not.have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('not.have.class', cls('cell-invalid'));
  });

  it('check `unique` validation after calling setRow', () => {
    cy.gridInstance().invoke('setRow', 2, { name: 'pen', price: 100 });

    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(1, 'name').should('not.have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('have.class', cls('cell-invalid'));
  });

  it('check `unique` validation after calling setValue', () => {
    cy.gridInstance().invoke('setValue', 2, 'name', 'pen');

    cy.getCell(0, 'name').should('have.class', cls('cell-invalid'));
    cy.getCell(1, 'name').should('not.have.class', cls('cell-invalid'));
    cy.getCell(2, 'name').should('have.class', cls('cell-invalid'));
  });

  it('clear existing unique info properly after calling resetData', () => {
    cy.gridInstance().invoke('resetData', [
      { name: 'note', price: 10000 },
      { name: 'pen', price: 2000 }
    ]);

    cy.getCell(0, 'name').should('not.have.class', cls('cell-invalid'));
    cy.getCell(1, 'name').should('not.have.class', cls('cell-invalid'));
  });
});
