import { cls } from '@/helper/dom';
import { HeaderRenderer, ColumnHeaderInfo, HeaderRendererProps } from '@/renderer/types';

export {};

class CustomRenderer implements HeaderRenderer {
  private el: HTMLElement;

  private columnInfo: ColumnHeaderInfo;

  public constructor(props: HeaderRendererProps) {
    this.columnInfo = props.columnInfo;
    const el = document.createElement('div');

    el.className = 'custom';
    el.textContent = `custom_${this.columnInfo.name}`;
    el.style.fontSize = '18px';
    el.style.fontStyle = 'italic';

    this.el = el;
  }

  public getElement() {
    return this.el;
  }
}

const data = [
  { id: 1, name: 'Kim', score: 90, grade: 'A' },
  { id: 2, name: 'Lee', score: 80, grade: 'B' }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

describe('setColumns()', () => {
  it('resets the column data', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({
      data,
      columns
    });

    cy.gridInstance().invoke('setColumns', [{ name: 'id' }, { name: 'score' }, { name: 'grade' }]);

    cy.getCellContent(0, 'id').should('have.text', '1');
    cy.getCellContent(0, 'score').should('have.text', '90');
    cy.getCellContent(0, 'grade').should('have.text', 'A');
    cy.getCellContent(1, 'id').should('have.text', '2');
    cy.getCellContent(1, 'score').should('have.text', '80');
    cy.getCellContent(1, 'grade').should('have.text', 'B');
  });

  it('focus, editing cell is removed when the column data is removed', () => {
    const columns = [{ name: 'id' }, { name: 'score' }, { name: 'grade', editor: 'text' }];
    cy.createGrid({
      data,
      columns,
      columnOptions: {
        frozenCount: 1,
        minWidth: 300
      }
    });
    cy.gridInstance().invoke('startEditingAt', 0, 2);

    cy.gridInstance().invoke('setColumns', [{ name: 'id' }, { name: 'score' }]);

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        rowKey: null,
        columnName: null,
        value: null
      });
    cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
  });

  it('focus, editing cell is removed when the column data is added', () => {
    const columns = [{ name: 'id', editor: 'text' }, { name: 'name' }];
    cy.createGrid({
      data,
      columns,
      columnOptions: {
        frozenCount: 1,
        minWidth: 300
      }
    });
    cy.gridInstance().invoke('startEditingAt', 0, 0);

    cy.gridInstance().invoke('setColumns', [
      { name: 'id', editor: 'text' },
      { name: 'name' },
      { name: 'grade', editor: 'text' }
    ]);

    cy.gridInstance()
      .invoke('getFocusedCell')
      .should('eql', {
        rowKey: null,
        columnName: null,
        value: null
      });
    cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
  });
});

describe('setColumnValues(), getColumnValues()', () => {
  beforeEach(() => {
    const columns = [{ name: 'name' }, { name: 'score' }, { name: 'grade' }];
    cy.createGrid({ data, columns });
  });

  it('getColumnValues() returns all values in the given column', () => {
    cy.gridInstance()
      .invoke('getColumnValues', 'name')
      .should('eql', ['Kim', 'Lee']);

    cy.gridInstance()
      .invoke('getColumnValues', 'score')
      .should('eql', [90, 80]);

    cy.gridInstance()
      .invoke('getColumnValues', 'grade')
      .should('eql', ['A', 'B']);
  });

  it('setColumnValues() sets the all values in the given column', () => {
    cy.gridInstance().invoke('setColumnValues', 'name', 'Park');

    cy.getCellByIdx(0, 0).should('to.have.text', 'Park');
    cy.getCellByIdx(1, 0).should('to.have.text', 'Park');

    cy.gridInstance().invoke('setColumnValues', 'score', 30);

    cy.getCellByIdx(0, 1).should('to.have.text', '30');
    cy.getCellByIdx(1, 1).should('to.have.text', '30');

    cy.gridInstance().invoke('setColumnValues', 'grade', 'A');

    cy.getCellByIdx(0, 2).should('to.have.text', 'A');
    cy.getCellByIdx(1, 2).should('to.have.text', 'A');
  });
});

describe('header align', () => {
  it('resets the column data', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        align: 'left',
        valign: 'top',
        columns: [{ name: 'grade', valign: 'bottom' }]
      }
    });

    cy.getHeaderCell('id')
      .should('have.css', 'vertical-align', 'top')
      .and('have.css', 'text-align', 'left');

    cy.getHeaderCell('name')
      .should('have.css', 'vertical-align', 'top')
      .and('have.css', 'text-align', 'left');

    cy.gridInstance().invoke('setColumns', [{ name: 'id' }, { name: 'score' }, { name: 'grade' }]);

    cy.getHeaderCell('grade')
      .should('have.css', 'vertical-align', 'bottom')
      .and('have.css', 'text-align', 'left');
  });
});

describe('getIndexOfColumn()', () => {
  it('returns the index of column having given columnName', () => {
    const columns = [{ name: 'id' }, { name: 'name' }, { name: 'age' }];
    cy.createGrid({ data, columns });

    cy.gridInstance()
      .invoke('getIndexOfColumn', 'name')
      .should('eq', 1);

    cy.gridInstance()
      .invoke('getIndexOfColumn', 'age')
      .should('eq', 2);
  });
});

describe('setHeader()', () => {
  it('change height', () => {
    const cellBorderWidth = 1;
    const height = 300;
    const paddingHorizontal = 8;
    const columns = [{ name: 'id' }, { name: 'name' }, { name: 'age' }];
    cy.createGrid({ data, columns });

    cy.gridInstance().invoke('setHeader', { height });
    cy.get(`.${cls('cell-header')}`).should($headers => {
      $headers.each((_, $header) => {
        expect(Cypress.$($header).height()).to.eq(height - cellBorderWidth - paddingHorizontal);
      });
    });
  });

  it('change complexColumns', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        complexColumns: [
          {
            header: 'info',
            name: 'mergeColumn1',
            childNames: ['id', 'name']
          }
        ]
      }
    });

    cy.get('[data-column-name=mergeColumn1]').should('have.text', 'info');

    cy.gridInstance().invoke('setHeader', {
      complexColumns: [
        {
          header: 'information',
          name: 'mergeColumn1',
          childNames: ['id', 'name']
        }
      ]
    });

    cy.getHeaderCell('mergeColumn1').should('have.text', 'information');
  });
});

describe('setColumnHeaders()', () => {
  it('change column headers', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];

    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        complexColumns: [
          {
            header: 'info',
            name: 'mergeColumn1',
            childNames: ['id', 'name']
          }
        ]
      }
    });

    cy.gridInstance().invoke('setColumnHeaders', {
      id: '_id',
      name: '_name',
      mergeColumn1: '_info'
    });

    cy.getHeaderCell('id').should('have.text', '_id');
    cy.getHeaderCell('name').should('have.text', '_name');
    cy.getHeaderCell('mergeColumn1').should('have.text', '_info');
  });
});

describe('customize header ui', () => {
  beforeEach(() => {
    const columns = [{ name: 'id' }, { name: 'name' }];

    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        complexColumns: [
          {
            header: 'info',
            name: 'mergeColumn1',
            childNames: ['id', 'name'],
            renderer: CustomRenderer
          }
        ],
        columns: [
          {
            name: 'id',
            renderer: CustomRenderer
          }
        ]
      }
    });
  });

  it('render custom header renderer properly', () => {
    cy.getHeaderCell('mergeColumn1').should('have.text', 'custom_mergeColumn1');
    cy.getHeaderCell('id').should('have.text', 'custom_id');
  });

  it('header selection is operated properly', () => {
    cy.getHeaderCell('mergeColumn1').within(() => {
      cy.root()
        .get('.custom')
        .click();

      cy.gridInstance()
        .invoke('getFocusedCell')
        .should('eql', {
          rowKey: 0,
          columnName: 'id',
          value: 1
        });
    });
  });
});

describe('hideColumn(), showColumn()', () => {
  it('should hide column when calling hideColumn() and show Column when calling showColumn()', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];

    cy.createGrid({
      data,
      columns,
      header: {
        height: 100
      }
    });

    cy.getHeaderCell('name').should('exist');

    cy.gridInstance().invoke('hideColumn', 'name');

    cy.getHeaderCell('name').should('not.exist');

    cy.gridInstance().invoke('showColumn', 'name');

    cy.getHeaderCell('name').should('exist');
  });

  it('hideColumn(), showColumn() with merged header', () => {
    const columns = [{ name: 'id' }, { name: 'name' }, { name: 'score' }, { name: 'grade' }];

    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        complexColumns: [
          {
            header: 'name',
            name: 'nameHeader',
            childNames: ['name', 'score'],
            hideChildHeaders: true
          }
        ]
      }
    });

    cy.getHeaderCell('nameHeader').should('exist');

    cy.gridInstance().invoke('hideColumn', 'nameHeader');

    cy.getHeaderCell('nameHeader').should('not.exist');
  });
});
