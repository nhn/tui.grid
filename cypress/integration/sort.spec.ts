import { Omit } from 'utility-types';
import { cls, dataAttr } from '../../src/helper/dom';
import { data as sampleData } from '../../samples/basic';
import Grid from '../../src/grid';
import { OptGrid, OptColumn } from '../../src/types';
import { comparator } from '@/helper/sort';
import { Dictionary } from '@/store/types';

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

const CONTENT_WIDTH = 700;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;

const columns: OptColumn[] = [
  { name: 'name', minWidth: 150, sortable: true },
  { name: 'price', minWidth: 150, sortable: true, sortingType: 'asc' },
  { name: 'downloadCount', minWidth: 150, sortable: true, sortingType: 'desc' }
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

function getGridInst(): Cypress.Chainable<Grid> {
  return (cy.window() as Cypress.Chainable<Window & GridGlobal>).its('grid');
}

function createSortButonAlias() {
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

function assertSortedData(columnName: string, ascending: boolean) {
  const testData = (sampleData as Dictionary<any>[]).map((data) => String(data[columnName]));
  testData.sort((a, b) => comparator(a, b, ascending));

  cy.get(`td[${dataAttr.COLUMN_NAME}=${columnName}]`).each(($el, index) => {
    expect($el.text()).to.eql(testData[index]);
  });
}

before(() => {
  cy.visit('/dist');
});

describe('sort', () => {
  beforeEach(() => {
    cy.document().then((doc) => {
      doc.body.innerHTML = '';
    });
  });

  it('sort button is rendered with proper class names', () => {
    createGrid();
    createSortButonAlias();
    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, false);
    assertSortClassNames('@second', true, false);
    assertSortClassNames('@second', false, false);
  });

  it("sort button's class names are changed when click the sort button", () => {
    createGrid();
    createSortButonAlias();

    cy.get('@first').click();
    assertSortClassNames('@first', true, true);
    assertSortClassNames('@first', false, false);

    cy.get('@first').click();
    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, true);

    assertSortClassNames('@second', true, false);
    assertSortClassNames('@second', false, false);

    cy.get('@second').click();
    assertSortClassNames('@second', true, true);
    assertSortClassNames('@second', false, false);

    assertSortClassNames('@first', true, false);
    assertSortClassNames('@first', false, false);
  });

  it('sort by descending order when the sort button is first clicked.', () => {
    createGrid();
    createSortButonAlias();

    cy.get('@third').click();
    assertSortClassNames('@third', true, false);
    assertSortClassNames('@third', false, true);
  });

  it('data is sorted properly', () => {
    createGrid();
    createSortButonAlias();

    cy.get('@first').click();
    assertSortedData('name', true);
  });

  it('data is sorted after calling sort(name, false)', () => {
    createGrid();
    createSortButonAlias();
    getGridInst().invoke('sort', 'name', false);

    assertSortedData('name', false);
  });

  it('data is sorted after calling unsort()', () => {
    createGrid();
    createSortButonAlias();
    getGridInst().invoke('sort', 'name', false);
    getGridInst().invoke('unsort');

    const testData = sampleData.map((data) => String(data.name));
    cy.get(`td[${dataAttr.COLUMN_NAME}=name]`).each(($el, index) => {
      expect($el.text()).to.eql(testData[index]);
    });
  });

  it('get proper sortState after calling getSortState()', () => {
    createGrid();
    createSortButonAlias();
    getGridInst()
      .invoke('getSortState')
      .should((sortState) => {
        expect(sortState).to.eql({
          ascending: true,
          columnName: 'rowKey',
          useClient: true
        });
      });

    cy.get('@first').click();

    getGridInst()
      .invoke('getSortState')
      .should((sortState) => {
        expect(sortState).to.eql({
          ascending: true,
          columnName: 'name',
          useClient: true
        });
      });
  });
});
