import { OptColumn } from '@/types';
import { FormatterProps } from '@/store/types';

export {};

type Address = [number, number];

function startEditingAt(rowInedx: number, columnIndex: number) {
  cy.gridInstance().invoke('startEditingAt', rowInedx, columnIndex);
}

function setColumns(columns: OptColumn[]) {
  cy.gridInstance().invoke('setColumns', columns);
}

function setSelection(start: Address, end: Address) {
  cy.gridInstance().invoke('setSelectionRange', { start, end });
}

before(() => {
  cy.visit('/dist');
});

describe('setColumns()', () => {
  beforeEach(() => {
    const data = [
      { id: 1, name: 'Kim', score: 90, grade: 'A' },
      { id: 2, name: 'Lee', score: 80, grade: 'B' }
    ];
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({ data, columns });
  });

  it('reset the columns', () => {
    const columns = [{ name: 'id' }, { name: 'score' }, { name: 'grade' }];
    setColumns(columns);

    cy.getRsideBody().should('have.cellData', [
      ['1', '90', 'A'],
      ['2', '80', 'B']
    ]);
  });

  it('focus, editing layer is removed', () => {
    const columns = [
      { name: 'id', editor: 'text' },
      { name: 'score' },
      { name: 'grade', editor: 'text' }
    ];
    startEditingAt(0, 0);
    setColumns(columns);

    cy.getByCls('layer-focus').should('not.be.visible');
    cy.getByCls('layer-editing').should('not.be.visible');
  });

  it('selection layer is removed', () => {
    const columns = [
      { name: 'id', editor: 'text' },
      { name: 'score' },
      { name: 'grade', editor: 'text' }
    ];
    setSelection([0, 0], [1, 1]);
    setColumns(columns);

    cy.getByCls('layer-selection').should('not.be.visible');
  });
});

describe('API', () => {
  beforeEach(() => {
    const data = [
      { id: 1, name: 'Kim', score: 90, grade: 'A' },
      { id: 2, name: 'Lee', score: 80, grade: 'B' }
    ];
    const columns = [{ name: 'name' }, { name: 'score' }];
    cy.createGrid({ data, columns });
  });

  it('getColumnValues()', () => {
    cy.gridInstance()
      .invoke('getColumnValues', 'name')
      .should('eql', ['Kim', 'Lee']);
  });

  it('setColumnValues()', () => {
    cy.gridInstance().invoke('setColumnValues', 'name', 'Park');

    cy.getColumnCells('name').should('sameColumnData', 'Park');
  });

  it('getIndexOfColumn()', () => {
    ['name', 'score'].forEach((column, index) => {
      cy.gridInstance()
        .invoke('getIndexOfColumn', column)
        .should('eq', index);
    });
  });

  it('hideColumns(), showColumn()', () => {
    cy.gridInstance().invoke('hideColumn', 'name');

    cy.getHeaderCell('name').should('not.exist');

    cy.gridInstance().invoke('showColumn', 'name');

    cy.getHeaderCell('name').should('exist');
  });
});

describe('formatter', () => {
  const data = [
    { name: 'Kim', age: 30 },
    { name: 'Lee', age: 40 }
  ];

  const ageFormatterProps1 = {
    column: { name: 'age' },
    row: data[0],
    value: 30
  };

  const ageFormatterProps2 = {
    column: { name: 'age' },
    row: data[1],
    value: 40
  };

  function assertAgeFormatterCallProps(formatterStub: any) {
    cy.wrap(formatterStub)
      .should('be.calledWithMatch', ageFormatterProps1)
      .and('be.calledWithMatch', ageFormatterProps2);
  }

  it('formatter should be applied to the value', () => {
    const formatterStub = cy.stub();
    const columns = [
      {
        name: 'name',
        formatter: ({ value }: FormatterProps) => `Mr. ${value}`
      },
      {
        name: 'age',
        formatter: formatterStub.returns('AGE')
      }
    ];

    cy.createGrid({ data, columns });

    cy.getCell(0, 'name').should('have.text', 'Mr. Kim');
    cy.getCell(1, 'name').should('have.text', 'Mr. Lee');
    cy.getCell(0, 'age').should('have.text', 'AGE');
    cy.getCell(1, 'age').should('have.text', 'AGE');

    assertAgeFormatterCallProps(formatterStub);
  });
});

describe('escapeHTML', () => {
  it('if escapeHTML is true, HTML Entities should be escaped', () => {
    const data = [{ name: '<b>Kim</b>', age: 10 }];
    const columns = [
      {
        name: 'name',
        escapeHTML: true
      },
      {
        name: 'age',
        formatter: ({ value }: FormatterProps) => `${value}<br/>`,
        escapeHTML: true
      }
    ];

    cy.createGrid({ data, columns });

    cy.getRsideBody().should('have.cellData', [['<b>Kim</b>', '10<br/>']]);
  });
});

describe('defaultValue', () => {
  it('if the vlaue is empty, defaultValue should be applied', () => {
    const data = [{ name: 'Lee', age: 20 }, {}];
    const columns = [
      {
        name: 'name',
        defaultValue: 'Kim'
      },
      {
        name: 'age',
        defaultValue: '30'
      }
    ];

    cy.createGrid({ data, columns });

    cy.getRsideBody().should('have.cellData', [
      ['Lee', '20'],
      ['Kim', '30']
    ]);
  });
});

describe('column className', () => {
  beforeEach(() => {
    const data = [
      {
        name: 'Kim',
        age: 30
      },
      {
        name: 'Lee',
        age: 40
      }
    ];
    const columns = [{ name: 'name', className: 'column-test-c' }, { name: 'age' }];

    cy.createGrid({ data, columns });
  });

  it('add class by column options', () => {
    cy.getColumnCells('name').each($el => {
      expect($el).to.have.class('column-test-c');
    });
  });
});
