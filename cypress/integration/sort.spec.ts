import { Omit } from 'utility-types';
import { cls, dataAttr } from '../../src/helper/dom';
import { sortData as sampleData } from '../../samples/basic';
import Grid from '../../src/grid';
import { OptGrid, OptColumn } from '../../src/types';
import { compare } from '@/helper/sort';
import { Dictionary } from '@/store/types';

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

const CONTENT_WIDTH = 700;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;

const columns: OptColumn[] = [
  { name: 'alphabetA', minWidth: 150, sortable: true },
  { name: 'alphabetB', minWidth: 150, sortable: true, sortingType: 'asc' },
  { name: 'numberA', minWidth: 150, sortable: true, sortingType: 'desc' },
  { name: 'stringNumberA', minWidth: 150, sortable: true, sortingType: 'asc' }
];

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  const data = sampleData.slice();

  return { data, columns };
}

function createGrid(customOptions: Record<string, unknown> = {}) {
  cy.window().then((win: Window & Partial<GridGlobal>) => {
    const { document, tui } = win;
    const defaultOptions = createDefaultOptions();
    const options = { ...defaultOptions, ...customOptions };
    const el = document.createElement('div');
    el.style.width = `${CONTENT_WIDTH + SCROLLBAR_WIDTH}px`;
    document.body.appendChild(el);

    win.grid = new tui!.Grid({ el, ...options });
    cy.wait(10);
  });
}

function createSortButtonAlias() {
  cy.get(`.${cls('btn-sorting')}`)
    .first()
    .as('first');
  cy.get(`.${cls('btn-sorting')}`)
    .eq(1)
    .as('second');
  cy.get(`.${cls('btn-sorting')}`)
    .eq(2)
    .as('third');
}

function assertSortClassNames(target: string, ascending: boolean, hasClass: boolean) {
  const className = ascending ? 'btn-sorting-up' : 'btn-sorting-down';
  if (hasClass) {
    cy.get(target).should('have.class', cls(className));
  } else {
    cy.get(target).should('have.not.class', cls(className));
  }
}

function assertSortedData(columnName: string) {
  const testData = (sampleData as Dictionary<any>[]).map(data => String(data[columnName]));
  testData.sort((a, b) => compare(a, b));

  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).should($el => {
    $el.each((index, elem) => {
      expect(elem.textContent).to.eql(testData[index]);
    });
  });
}

function compareColumnData(columnName: string, expectValues: string[] | number[]) {
  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).should($el => {
    $el.each((index, elem) => {
      expect(elem.textContent).to.eql(expectValues[index]);
    });
  });
}

before(() => {
  cy.visit('/dist');
});

describe('sort', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });
  });

  it('sort button is rendered with proper class names', () => {
    createGrid();
    createSortButtonAlias();
    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, false);
    assertSortClassNames('@second', true, false);
    assertSortClassNames('@second', false, false);
  });

  it("sort button's class names are changed when click the sort button", () => {
    createGrid();
    createSortButtonAlias();

    cy.get('@first').click();
    assertSortClassNames('@first', true, true);
    assertSortClassNames('@first', false, false);

    cy.get('@first').click();
    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, true);

    cy.get('@second').click();
    assertSortClassNames('@second', true, true);
    assertSortClassNames('@second', false, false);

    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, false);

    cy.get('@second').click();
    cy.get('@second').click();
    assertSortClassNames('@second', true, false);
    assertSortClassNames('@second', false, false);
  });

  it('sort by descending order when the sort button is first clicked.', () => {
    createGrid();
    createSortButtonAlias();

    cy.get('@third').click();
    assertSortClassNames('@third', true, false);
    assertSortClassNames('@third', false, true);
  });

  it('data is sorted properly', () => {
    createGrid();
    createSortButtonAlias();

    cy.get('@first').click();
    assertSortedData('alphabetA');
  });

  it('data is sorted after calling sort(alphabetA, false)', () => {
    createGrid();
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'alphabetA', true);
    assertSortedData('alphabetA');
  });

  it('sort by ascending order stringNumberA', () => {
    createGrid();
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'stringNumberA', true);
    compareColumnData('stringNumberA', ['1', '2', '11', '100', '101', '201', '202', '211', '301']);
  });

  it('sort by descending order stringNumberA', () => {
    createGrid();
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'stringNumberA', false);
    compareColumnData('stringNumberA', ['301', '211', '202', '201', '101', '100', '11', '2', '1']);
  });

  it('multiple sort', () => {
    createGrid();
    cy.gridInstance().invoke('sort', 'numberA', true);
    cy.gridInstance().invoke('sort', 'alphabetB', true, true);

    cy.get(`th[${dataAttr.COLUMN_NAME}=numberA]`).contains('1');
    cy.get(`th[${dataAttr.COLUMN_NAME}=alphabetB]`).contains('2');

    compareColumnData('numberA', ['1', '1', '1', '1', '2', '10', '20', '24', '25']);
    compareColumnData('alphabetB', ['A', 'A', 'B', 'E', 'B', 'B', 'C', 'A', 'F']);
  });

  it('data is sorted after calling unsort()', () => {
    createGrid();
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'alphabetA', false);
    cy.gridInstance().invoke('unsort');

    const testData = sampleData.map(data => String(data.alphabetA));

    cy.get('@first').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@first').should('not.have.class', cls('btn-sorting-down'));
    compareColumnData('alphabetA', testData);
  });

  it("unsort('numberA') when multiple sorting", () => {
    createGrid();
    createSortButtonAlias();

    cy.gridInstance().invoke('sort', 'numberA', true);
    cy.gridInstance().invoke('sort', 'alphabetA', true, true);

    cy.get(`th[${dataAttr.COLUMN_NAME}=numberA]`).contains('1');
    cy.get(`th[${dataAttr.COLUMN_NAME}=alphabetA]`).contains('2');

    cy.gridInstance().invoke('unsort', 'numberA');

    assertSortedData('alphabetA');
  });

  it('get proper sortState after calling getSortState()', () => {
    createGrid();
    createSortButtonAlias();
    cy.gridInstance()
      .invoke('getSortState')
      .should(sortState => {
        expect(sortState).to.eql({
          useClient: true,
          columns: [
            {
              ascending: true,
              columnName: 'sortKey'
            }
          ]
        });
      });

    cy.get('@first').click();

    cy.gridInstance()
      .invoke('getSortState')
      .should(sortState => {
        expect(sortState).to.eql({
          useClient: true,
          columns: [
            {
              ascending: true,
              columnName: 'alphabetA'
            }
          ]
        });
      });
  });

  it('cannot sort the data on non sortable column', () => {
    const col: OptColumn[] = [
      { name: 'alphabetA', minWidth: 150, sortable: true },
      { name: 'alphabetB', minWidth: 150, sortable: true, sortingType: 'asc' },
      { name: 'numberA', minWidth: 150 }
    ];
    createGrid({ columns: col });
    cy.gridInstance().invoke('sort', 'numberA', true);

    compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
  });

  it('data is unsorted when calls resetData API', () => {
    createGrid();
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'numberA', false);
    cy.gridInstance().invoke('resetData', sampleData.slice());

    compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });

  it('data is unsorted when calls setColumns API', () => {
    createGrid();
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'numberA', false);
    cy.gridInstance().invoke('setColumns', columns);

    compareColumnData('numberA', ['2', '1', '1', '1', '10', '1', '20', '24', '25']);
    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });

  it('data is unsorted when calls clearData API', () => {
    createGrid();
    createSortButtonAlias();
    cy.gridInstance().invoke('sort', 'numberA', false);
    cy.gridInstance().invoke('clear');

    cy.get('@third').should('not.have.class', cls('btn-sorting-up'));
    cy.get('@third').should('not.have.class', cls('btn-sorting-down'));
  });
});
