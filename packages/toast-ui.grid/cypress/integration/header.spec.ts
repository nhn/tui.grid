import { AlignType, VAlignType } from '@t/store/column';
import { HeaderRenderer, ColumnHeaderInfo, HeaderRendererProps } from '@t/renderer';

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

  public render(props: HeaderRendererProps) {
    this.columnInfo = props.columnInfo;
    this.el.textContent = `custom_${this.columnInfo.name}`;
  }
}

function assertColumnWidth(firstColumnName: string, width: number) {
  cy.getColumnCells(firstColumnName).each(($el) => {
    expect($el.width()).to.eql(width);
  });
}

function assertAlign(columnName: string, align: AlignType, valign: VAlignType) {
  cy.getHeaderCell(columnName)
    .should('have.css', 'vertical-align', valign)
    .and('have.css', 'text-align', align);
}

const data = [
  { id: 1, name: 'Kim', score: 90, grade: 'A' },
  { id: 2, name: 'Lee', score: 80, grade: 'B' },
];

before(() => {
  cy.visit('/dist');
});

describe('header align', () => {
  beforeEach(() => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({
      data,
      columns,
      header: {
        height: 100,
        align: 'left',
        valign: 'top',
        columns: [{ name: 'grade', valign: 'bottom' }],
      },
    });
  });

  it('should apply align, valign', () => {
    assertAlign('id', 'left', 'top');
    assertAlign('name', 'left', 'top');
  });

  it('should apply align, valign after calling setColumns()', () => {
    cy.gridInstance().invoke('setColumns', [{ name: 'grade' }]);

    assertAlign('grade', 'left', 'bottom');
  });
});

describe('complex column header', () => {
  beforeEach(() => {
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
            childNames: ['id', 'name'],
            hideChildHeaders: true,
            resizable: true,
          },
          {
            header: 'scoreInfo',
            name: 'complexColumn',
            childNames: ['score', 'grade'],
            resizable: true,
          },
        ],
      },
    });
  });

  it('should render merged header and complex column header properly', () => {
    // merged header
    cy.getHeaderCell('nameHeader').should('exist');
    cy.getCell(0, 'id').should('exist');
    cy.getCell(0, 'name').should('exist');
    // complex column header
    cy.getHeaderCell('complexColumn').should('exist');
  });

  it('hideColumn(), showColumn() with normal header included in complex column', () => {
    cy.gridInstance().invoke('hideColumn', 'grade');

    cy.getColumnCells('grade').should('not.exist');

    cy.gridInstance().invoke('showColumn', 'grade');

    cy.getColumnCells('grade').should('exist');
  });

  it('hideColumn(), showColumn() with merged header', () => {
    cy.gridInstance().invoke('hideColumn', 'nameHeader');

    cy.getHeaderCell('nameHeader').should('not.exist');
    cy.getCell(0, 'id').should('not.exist');
    cy.getCell(0, 'name').should('not.exist');

    cy.gridInstance().invoke('showColumn', 'nameHeader');

    cy.getHeaderCell('nameHeader').should('exist');
    cy.getCell(0, 'id').should('exist');
    cy.getCell(0, 'name').should('exist');
  });

  it('should replace complexColumns after calling setHeader()', () => {
    cy.gridInstance().invoke('setHeader', {
      complexColumns: [
        {
          header: 'nameInformation',
          name: 'complexColumn',
          childNames: ['id', 'name'],
        },
      ],
    });

    cy.getHeaderCell('complexColumn').should('exist');
    cy.getHeaderCell('nameHeader').should('not.exist');
    cy.getHeaderCell('scoreInfo').should('not.exist');
  });

  it('setColumnHeaders()', () => {
    cy.gridInstance().invoke('setColumnHeaders', {
      score: '_score',
      grade: '_grade',
      complexColumn: '_scoreInfo',
    });

    cy.getHeaderCell('score').should('have.text', '_score');
    cy.getHeaderCell('grade').should('have.text', '_grade');
    cy.getHeaderCell('complexColumn').should('have.text', '_scoreInfo');
  });

  it('should resize width to child column width equally when move hide child complex column resizer.', () => {
    assertColumnWidth('id', 196);
    assertColumnWidth('name', 196);

    cy.dragColumnResizeHandle(0, -19);

    assertColumnWidth('id', 186);
    assertColumnWidth('name', 186);
  });

  it('should resize width to child column width equally when move complex column resizer.', () => {
    assertColumnWidth('score', 196);
    assertColumnWidth('grade', 195);

    cy.dragColumnResizeHandle(1, -19);

    assertColumnWidth('score', 186);
    assertColumnWidth('grade', 185);
  });
});

it('should change the header height after calling setHeader()', () => {
  const paddingHorizontal = 10;
  const columns = [{ name: 'id' }, { name: 'name' }, { name: 'age' }];
  const height = 300;

  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('setHeader', { height });

  cy.getByCls('cell-header').each(($headers) => {
    cy.wrap($headers)
      .invoke('height')
      .should('eq', height - paddingHorizontal);
  });
});

describe('header customizing', () => {
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
            renderer: CustomRenderer,
          },
        ],
        columns: [
          {
            name: 'id',
            renderer: CustomRenderer,
          },
        ],
      },
    });
  });

  it('should render custom header renderer properly', () => {
    cy.getHeaderCell('mergeColumn1').should('have.text', 'custom_mergeColumn1');
    cy.getHeaderCell('id').should('have.text', 'custom_id');
  });

  it('should header selection is operated properly', () => {
    cy.getHeaderCell('mergeColumn1').within(() => {
      cy.root().get('.custom').click();

      cy.gridInstance().invoke('getFocusedCell').should('eql', {
        rowKey: 0,
        columnName: 'id',
        value: 1,
      });
    });
  });
});
