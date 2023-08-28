import { OptColumn } from '@t/options';
import { FormatterProps } from '@t/store/column';
import { cls } from '@/helper/dom';
import { dragAndDropColumn } from '../helper/util';

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

function assertColumnHeaderAndData(headerData: string[][], cellData: string[][]) {
  cy.getRsideHeader().should('have.headerData', headerData);
  cy.getRsideBody().should('have.cellData', cellData);
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

  it('getColumn()', () => {
    cy.gridInstance().invoke('getColumn', 'score').should('have.deep.property', 'name', 'score');
    cy.gridInstance().invoke('getColumn', 'notExistColumn').should('eq', null);
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

describe('move column', () => {
  function getActiveFocusLayer() {
    return cy.getByCls('layer-focus');
  }

  function getActiveSelectionlayer() {
    return cy.getByCls('layer-selection');
  }

  const data = [
    { name: 'Kim', age: 10, price: 100 },
    { name: 'Lee', age: 20, price: 200 },
    { name: 'Ryu', age: 30, price: 300 },
    { name: 'Han', age: 40, price: 400 },
  ];
  const columns = [{ name: 'name' }, { name: 'age' }, { name: 'price' }];

  const originalHeader = [['name', 'age', 'price']];
  const originalData = [
    ['Kim', '10', '100'],
    ['Lee', '20', '200'],
    ['Ryu', '30', '300'],
    ['Han', '40', '400'],
  ];

  ['UI(D&D)', 'API'].forEach((type) => {
    describe(`Default by ${type}`, () => {
      beforeEach(() => {
        cy.createGrid({
          data,
          columns,
          bodyHeight: 400,
          draggable: true,
        });
      });

      it('should move the column by dragging the column(left direction)', () => {
        assertColumnHeaderAndData(originalHeader, originalData);

        if (type === 'API') {
          cy.gridInstance().invoke('moveColumn', 'age', 1);
        } else {
          dragAndDropColumn('age', 150);
        }

        assertColumnHeaderAndData(
          [['age', 'name', 'price']],
          [
            ['10', 'Kim', '100'],
            ['20', 'Lee', '200'],
            ['30', 'Ryu', '300'],
            ['40', 'Han', '400'],
          ]
        );
      });

      it('should move the column by dragging the column(right direction)', () => {
        assertColumnHeaderAndData(originalHeader, originalData);

        if (type === 'API') {
          cy.gridInstance().invoke('moveColumn', 'age', 3);
        } else {
          dragAndDropColumn('age', 650);
        }

        assertColumnHeaderAndData(
          [['name', 'price', 'age']],
          [
            ['Kim', '100', '10'],
            ['Lee', '200', '20'],
            ['Ryu', '300', '30'],
            ['Han', '400', '40'],
          ]
        );
      });

      it('should remove the focus when starting to drag element', () => {
        cy.gridInstance().invoke('focus', 1, 'name');

        if (type === 'API') {
          cy.gridInstance().invoke('moveColumn', 'age', 1);
        } else {
          dragAndDropColumn('age', 150);
        }

        getActiveFocusLayer().should('not.exist');
      });

      it('should remove the selection when starting to drag element', () => {
        cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [1, 1] });

        if (type === 'API') {
          cy.gridInstance().invoke('moveColumn', 'age', 1);
        } else {
          dragAndDropColumn('age', 150);
        }

        getActiveSelectionlayer().should('not.exist');
      });

      if (type === 'UI(D&D)') {
        it('should not move the column by dragging the column if it is disabled', () => {
          assertColumnHeaderAndData(originalHeader, originalData);

          cy.gridInstance().invoke('disableColumn', 'name');

          dragAndDropColumn('name', 650);

          assertColumnHeaderAndData(originalHeader, originalData);
        });
      }
    });

    describe(`With row header by ${type}`, () => {
      beforeEach(() => {
        const rowHeaders = [
          {
            type: 'rowNum',
          },
          {
            type: 'checkbox',
          },
        ];

        cy.createGrid({
          data,
          columns,
          bodyHeight: 400,
          draggable: true,
          rowHeaders,
        });
      });

      ['_number', '_checked', '_draggable'].forEach((rowHeaderName) => {
        it(`should not move the column by dragging the column if it is row header column (${rowHeaderName})`, () => {
          assertColumnHeaderAndData(originalHeader, originalData);

          if (type === 'API') {
            cy.gridInstance().invoke('moveColumn', rowHeaderName, 4);
          } else {
            dragAndDropColumn(rowHeaderName, 650);
          }

          assertColumnHeaderAndData(originalHeader, originalData);
        });
      });
    });

    describe(`With complex columns by ${type}`, () => {
      const originalComplexHeader = [
        ['human', 'price'],
        ['name', 'age'],
      ];

      function createGridWithComplexColumn() {
        const complexColumns = [{ header: 'human', name: 'human', childNames: ['name', 'age'] }];

        cy.createGrid({
          data,
          columns,
          bodyHeight: 400,
          draggable: true,
          header: { height: 80, complexColumns },
        });
      }

      it('should not move the column by dragging the column if it has complex columns', () => {
        createGridWithComplexColumn();

        assertColumnHeaderAndData(originalComplexHeader, originalData);

        if (type === 'API') {
          cy.gridInstance().invoke('moveColumn', 'name', 3);
        } else {
          dragAndDropColumn('name', 650);
        }

        assertColumnHeaderAndData(originalComplexHeader, originalData);
      });
    });
  });
});

describe('customHeader', () => {
  let customHeader: HTMLElement;

  const CUSTOM_HEADER_CLASS_NAME = 'custom-header';
  const data = [
    { name: 'Kim', age: 10, price: 100 },
    { name: 'Lee', age: 20, price: 200 },
    { name: 'Ryu', age: 30, price: 300 },
    { name: 'Han', age: 40, price: 400 },
  ];

  beforeEach(() => {
    customHeader = document.createElement('div');
    customHeader.className = CUSTOM_HEADER_CLASS_NAME;
    customHeader.textContent = 'Custom Header';
  });

  it('should render the given HTML element to the header.', () => {
    const columns = [
      { name: 'name', header: 'Name', customHeader },
      { name: 'age', header: 'Age' },
      { name: 'price', header: 'Price' },
    ];

    cy.createGrid({
      data,
      columns,
    });

    cy.getHeaderCell('name').click().should('contain.html', customHeader.outerHTML);
  });

  it('should sets the textContent of the customHeader to the value of the header property if no header property is passed.', () => {
    const columns = [
      { name: 'name', customHeader },
      { name: 'age', header: 'Age' },
      { name: 'price', header: 'Price' },
    ];

    cy.createGrid({
      data,
      columns,
    });

    cy.gridInstance()
      .invoke('getColumn', 'name')
      .should('contain', { header: customHeader.textContent });
  });
});
