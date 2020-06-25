import { OptColumn } from '@t/options';
import { FormatterProps } from '@t/store/column';
import { cls } from '@/helper/dom';

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

function assertDisabledColumn(columnName: string, disabled: boolean) {
  cy.getColumnCells(columnName).each(($el) => {
    if (disabled) {
      cy.wrap($el).should('have.class', cls('cell-disabled'));
    } else {
      cy.wrap($el).should('not.have.class', cls('cell-disabled'));
    }
  });
}

function assertColumnClassName(columnName: string, className: string) {
  cy.getColumnCells(columnName).each(($el) => {
    cy.wrap($el).should('have.class', className);
  });
}

before(() => {
  cy.visit('/dist');
});

describe('setColumns()', () => {
  beforeEach(() => {
    const data = [
      { id: 1, name: 'Kim', score: 90, grade: 'A' },
      { id: 2, name: 'Lee', score: 80, grade: 'B' },
    ];
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({ data, columns });
  });

  it('reset the columns', () => {
    const columns = [{ name: 'id' }, { name: 'score' }, { name: 'grade' }];
    setColumns(columns);

    cy.getRsideBody().should('have.cellData', [
      ['1', '90', 'A'],
      ['2', '80', 'B'],
    ]);
  });

  it('focus, editing layer is removed', () => {
    const columns = [
      { name: 'id', editor: 'text' },
      { name: 'score' },
      { name: 'grade', editor: 'text' },
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
      { name: 'grade', editor: 'text' },
    ];
    setSelection([0, 0], [1, 1]);
    setColumns(columns);

    cy.getByCls('layer-selection').should('not.be.visible');
  });

  it('After setColumn() not observable column, the value is properly reflected at setValue()', () => {
    const columns = [{ name: 'newColumn', defaultValue: 100 }];

    setColumns(columns);
    cy.gridInstance().invoke('setValue', 0, 'newColumn', 1000);

    cy.getRsideBody().should('have.cellData', [['1000'], ['100']]);
  });
});

describe('API', () => {
  beforeEach(() => {
    const data = [
      { id: 1, name: 'Kim', score: 90, grade: 'A' },
      { id: 2, name: 'Lee', score: 80, grade: 'B' },
    ];
    const columns = [{ name: 'name' }, { name: 'score', disabled: true }];
    cy.createGrid({ data, columns });
  });

  it('getColumnValues()', () => {
    cy.gridInstance().invoke('getColumnValues', 'name').should('eql', ['Kim', 'Lee']);
  });

  context('setColumnValues()', () => {
    it('should change values of specific column', () => {
      cy.gridInstance().invoke('setColumnValues', 'name', 'Park');

      cy.getColumnCells('name').should('have.sameColumnData', 'Park');
    });

    it('should not change values of disabled cell with checkCellState: true', () => {
      cy.gridInstance().invoke('setColumnValues', 'score', '100', true);

      cy.getCell(0, 'score').should('have.text', '90');
      cy.getCell(1, 'score').should('have.text', '80');
    });
  });

  it('getIndexOfColumn()', () => {
    ['name', 'score'].forEach((column, index) => {
      cy.gridInstance().invoke('getIndexOfColumn', column).should('eq', index);
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
    { name: 'Lee', age: 40 },
  ];

  const ageFormatterProps1 = {
    column: { name: 'age' },
    row: data[0],
    value: 30,
  };

  const ageFormatterProps2 = {
    column: { name: 'age' },
    row: data[1],
    value: 40,
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
        formatter: ({ value }: FormatterProps) => `Mr. ${value}`,
      },
      {
        name: 'age',
        formatter: formatterStub.returns('AGE'),
      },
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
        escapeHTML: true,
      },
      {
        name: 'age',
        formatter: ({ value }: FormatterProps) => `${value}<br/>`,
        escapeHTML: true,
      },
    ];

    cy.createGrid({ data, columns });

    cy.getRsideBody().should('have.cellData', [['<b>Kim</b>', '10<br/>']]);
  });
});

describe('defaultValue', () => {
  it('if the value is empty, defaultValue should be applied', () => {
    const data = [{ name: 'Lee', age: 20 }, {}];
    const columns = [
      {
        name: 'name',
        defaultValue: 'Kim',
      },
      {
        name: 'age',
        defaultValue: '30',
      },
    ];

    cy.createGrid({ data, columns });

    cy.getRsideBody().should('have.cellData', [
      ['Lee', '20'],
      ['Kim', '30'],
    ]);
  });
});

describe('column className', () => {
  beforeEach(() => {
    const data = [
      {
        name: 'Kim',
        age: 30,
      },
      {
        name: 'Lee',
        age: 40,
      },
    ];
    const columns = [{ name: 'name', className: 'column-test-c' }, { name: 'age' }];

    cy.createGrid({ data, columns });
  });

  it('add class by column options', () => {
    assertColumnClassName('name', 'column-test-c');
  });
});

describe('column disable', () => {
  beforeEach(() => {
    const data = [
      {
        name: 'Kim',
        age: 30,
        location: 'seoul',
      },
      {
        name: 'Lee',
        age: 40,
        location: 'busan',
      },
      {
        name: 'Han',
        age: 28,
        location: 'Bundang',
      },
    ];
    const columns = [{ name: 'name', disabled: true }, { name: 'age' }, { name: 'location' }];

    cy.createGrid({ data, columns, rowHeaders: ['checkbox'] });
  });

  it('column disable by column options', () => {
    assertDisabledColumn('name', true);
    assertDisabledColumn('age', false);
    assertDisabledColumn('location', false);
  });

  it('enableColumn() / disableColumn()', () => {
    cy.gridInstance().invoke('disableColumn', 'age');

    assertDisabledColumn('age', true);
  });
});
