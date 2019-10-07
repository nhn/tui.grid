import { Omit } from 'utility-types';
import { cls } from '../../src/helper/dom';
import { sortData as sampleData } from '../../samples/basic';
import Grid from '../../src/grid';
import { OptGrid, OptColumn, CellValue } from '../../src/types';
import { getUnixTime } from '@/helper/filter';

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

const CONTENT_WIDTH = 700;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;

const columns: OptColumn[] = [
  { name: 'alphabetA', minWidth: 100, editor: 'text', filter: { type: 'text', operator: 'AND' } },
  { name: 'alphabetB', minWidth: 100, filter: 'select' },
  {
    name: 'date',
    minWidth: 150,
    filter: { type: 'date', options: { date: new Date(2019, 9, 19) } }
  },
  {
    name: 'numberA',
    minWidth: 150,
    editor: 'text',
    filter: { type: 'number', showClearBtn: true, showApplyBtn: true }
  },
  {
    name: 'value'
  },
  { name: 'alphabetC', minWidth: 100, filter: 'text' }
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
  cy.get(`.${cls('btn-filter')}`)
    .first()
    .as('firstFilter');

  cy.get(`.${cls('btn-filter')}`)
    .eq(1)
    .as('secondFilter');

  cy.get(`.${cls('btn-filter')}`)
    .eq(2)
    .as('thirdFilter');

  cy.get(`.${cls('btn-filter')}`)
    .eq(3)
    .as('fourthFilter');
}

function equalColumnData(columnName: string, expectValues: CellValue) {
  cy.get(`[data-column-name=${columnName}]td.${cls('cell')}`).should($el => {
    $el.each((index, elem) => {
      expect(elem.textContent).to.eql(expectValues);
    });
  });
}

function notEqualColumnData(columnName: string, expectValues: CellValue) {
  cy.get(`[data-column-name=${columnName}]td.${cls('cell')}`).should($el => {
    $el.each((index, elem) => {
      expect(elem.textContent).not.to.eql(expectValues);
    });
  });
}

function compareColumnCellLength(length: number) {
  if (length) {
    const columnLength = 6;
    cy.get(`td.${cls('cell')}`)
      .its('length')
      .should('be.eq', length * columnLength);
  } else {
    cy.get(`td.${cls('cell')}`).should('not.exist');
  }
}

before(() => {
  cy.visit('/dist');
});

describe('common', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });
    createGrid();
  });

  it('If the filter is not active, it has a gray button. In the filter active case, it has a blue button.', () => {
    cy.get('@firstFilter').should('not.have.class', cls('btn-filter-active'));
    cy.gridInstance().invoke('filter', 'alphabetA', [{ code: 'eq', value: 'A' }]);
    cy.get('@firstFilter').should('have.class', cls('btn-filter-active'));
    compareColumnCellLength(4);
  });

  it('After editing, the filtering result is applied immediately.', () => {
    cy.gridInstance().invoke('filter', 'alphabetA', [{ code: 'eq', value: 'A' }]);

    cy.getCell(3, 'alphabetA')
      .click()
      .trigger('dblclick');

    cy.get(`.${cls('content-text')}`)
      .type('B')
      .then(() => {
        cy.getCell(4, 'alphabetB').click();
        compareColumnCellLength(3);
      });
  });

  it('If click the clear button, filtering is initialized.', () => {
    compareColumnCellLength(9);
    cy.get('@fourthFilter').click();
    cy.get(`.${cls('filter-input')}`).type('20');
    cy.get(`.${cls('filter-btn-apply')}`).click();
    compareColumnCellLength(1);
    cy.get(`.${cls('filter-btn-clear')}`).click();
    compareColumnCellLength(9);
  });

  it('If apply button exists, the condition is not immediately applied. But It is applied when click the button.', () => {
    cy.get('@fourthFilter').click();
    cy.get(`.${cls('filter-input')}`).type('20');
    compareColumnCellLength(9);

    cy.get(`.${cls('filter-btn-apply')}`).click();

    compareColumnCellLength(1);
    equalColumnData('numberA', '20');
  });

  it('Duplicate filters are applied correctly.', () => {
    cy.gridInstance()
      .invoke('filter', 'alphabetA', [{ code: 'eq', value: 'A' }])
      .get('@secondFilter')
      .click()
      .get(`.${cls('filter-list-item')} label`)
      .eq(1)
      .click();
    cy.wait(150);
    compareColumnCellLength(2);
    equalColumnData('alphabetA', 'A');
    equalColumnData('alphabetB', 'A');
  });

  it('The operator and the second filter appear when the first condition value exists.', () => {
    cy.get('@firstFilter').click();
    cy.get(`.${cls('filter-input')}`).type('B');
    cy.get(`.${cls('filter-comparator-container')}`).should('exist');
    cy.get(`.${cls('filter-input')}`)
      .its('length')
      .should('to.eq', 2);
  });

  it('If an operator exists, it combines the values of the two filters and outputs them accordingly.', () => {
    cy.get('@firstFilter').click();
    cy.get(`.${cls('filter-dropdown')} select`).select('start');
    cy.get(`.${cls('filter-input')}`).type('B');
    cy.get(`.${cls('filter-dropdown')} select`)
      .eq(1)
      .select('end');
    cy.get(`.${cls('filter-input')}`)
      .eq(1)
      .type('CA');
    equalColumnData('alphabetA', 'BCA');
  });
});

describe('filter API', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });
    createGrid();
  });

  it('filter(), unfilter()', () => {
    cy.gridInstance().invoke('filter', 'alphabetA', [{ code: 'eq', value: 'A' }]);
    cy.get('@firstFilter').should('have.class', cls('btn-filter-active'));
    equalColumnData('alphabetA', 'A');

    cy.gridInstance().invoke('unfilter', 'alphabetA');
    cy.get('@firstFilter').should('not.have.class', cls('btn-filter-active'));
    compareColumnCellLength(9);
  });

  it('getFilterState() return current filter state', () => {
    cy.gridInstance().invoke('filter', 'alphabetA', [{ code: 'eq', value: 'A' }]);
    cy.gridInstance()
      .invoke('getFilterState')
      .should(filterState => {
        expect(filterState).to.contain.subset([
          {
            columnName: 'alphabetA',
            state: [{ code: 'eq', value: 'A' }],
            type: 'text'
          }
        ]);
      });
    cy.gridInstance().invoke('filter', 'alphabetA', [
      { code: 'eq', value: 'A' },
      { code: 'ne', value: 'B' }
    ]);
    cy.gridInstance()
      .invoke('getFilterState')
      .should(filterState => {
        expect(filterState).to.contain.subset([
          {
            columnName: 'alphabetA',
            state: [{ code: 'eq', value: 'A' }, { code: 'ne', value: 'B' }],
            type: 'text',
            operator: 'AND'
          }
        ]);
      });
  });

  it('setFilter() set filter to column', () => {
    cy.get(`[data-column-name=value] .${cls('btn-filter')}`).should('not.exist');
    cy.gridInstance().invoke('setFilter', 'value', { type: 'number' });
    cy.get(`[data-column-name=value] .${cls('btn-filter')}`).should('exist');
  });
});

describe('number', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });
    createGrid();
  });

  it('Equal', () => {
    cy.gridInstance().invoke('filter', 'numberA', [{ code: 'eq', value: 1 }]);
    equalColumnData('numberA', '1');
    compareColumnCellLength(4);
  });

  it('Not Equal', () => {
    cy.gridInstance().invoke('filter', 'numberA', [{ code: 'ne', value: 1 }]);
    notEqualColumnData('numberA', '1');
    compareColumnCellLength(5);
  });

  it('Less than', () => {
    cy.gridInstance().invoke('filter', 'numberA', [{ code: 'lt', value: 10 }]);
    cy.get(`[data-column-name=numberA]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(Number(elem.textContent) < 10).to.be.true;
      });
    });
    compareColumnCellLength(5);
  });
  it('Less than Equal', () => {
    cy.gridInstance().invoke('filter', 'numberA', [{ code: 'lte', value: 10 }]);
    cy.get(`[data-column-name=numberA]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(Number(elem.textContent) <= 10).to.be.true;
      });
    });
    compareColumnCellLength(6);
  });
  it('Greater than', () => {
    cy.gridInstance().invoke('filter', 'numberA', [{ code: 'gt', value: 10 }]);
    cy.get(`[data-column-name=numberA]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(Number(elem.textContent) > 10).to.be.true;
      });
    });
    compareColumnCellLength(3);
  });
  it('Greater than Equal', () => {
    cy.gridInstance().invoke('filter', 'numberA', [{ code: 'gte', value: 10 }]);
    cy.get(`[data-column-name=numberA]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(Number(elem.textContent) >= 10).to.be.true;
      });
    });
    compareColumnCellLength(4);
  });
});

describe('text', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });
    createGrid();
  });

  it('Equal', () => {
    cy.gridInstance().invoke('filter', 'alphabetC', [{ code: 'eq', value: 'ACC' }]);
    equalColumnData('alphabetC', 'ACC');
    compareColumnCellLength(2);
  });

  it('Not Equal', () => {
    cy.gridInstance().invoke('filter', 'alphabetC', [{ code: 'ne', value: 'ACC' }]);
    notEqualColumnData('alphabetC', 'ACC');
    compareColumnCellLength(7);
  });

  it('Contain', () => {
    cy.gridInstance().invoke('filter', 'alphabetC', [{ code: 'contain', value: 'A' }]);
    cy.get(`[data-column-name=alphabetC]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(elem.textContent!.includes('A')).to.be.true;
      });
    });
    compareColumnCellLength(5);
  });

  it('start', () => {
    cy.gridInstance().invoke('filter', 'alphabetC', [{ code: 'start', value: 'A' }]);
    cy.get(`[data-column-name=alphabetC]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(elem.textContent!.startsWith('A')).to.be.true;
      });
    });
    compareColumnCellLength(4);
  });

  it('end', () => {
    cy.gridInstance().invoke('filter', 'alphabetC', [{ code: 'end', value: 'A' }]);
    cy.get(`[data-column-name=alphabetC]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(elem.textContent!.endsWith('A')).to.be.true;
      });
    });
    compareColumnCellLength(3);
  });
});

describe('select', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });
    createGrid();
  });

  it('Only the row of the selected checkbox is displayed.', () => {
    cy.get('@secondFilter').click();
    cy.get(`.${cls('filter-list-item')} label`)
      .eq(1)
      .click();
    notEqualColumnData('alphabetB', 'B');
    compareColumnCellLength(6);
  });

  it('When searching, the items contained text are listed.', () => {
    cy.get('@secondFilter').click();
    cy.get(`.${cls('filter-input')}`).type('B');
    cy.get(`.${cls('filter-list-item')} label`)
      .its('length')
      .should('be.eq', 2);
  });

  it('When click selectAll checkbox, apply all list item checkbox and filtering.', () => {
    cy.get('@secondFilter').click();
    cy.get(`.${cls('filter-list-item')} label`)
      .eq(0)
      .click();
    compareColumnCellLength(0);

    cy.get(`.${cls('filter-list-item')} label`)
      .eq(0)
      .click();

    compareColumnCellLength(9);
  });
});

describe('date', () => {
  beforeEach(() => {
    cy.document().then(doc => {
      doc.body.innerHTML = '';
    });
    createGrid();
  });

  it('Equal', () => {
    cy.get('@thirdFilter').click();
    cy.get(`.${cls('filter-input')}`)
      .focus()
      .click();
    // 2019.09.18 timestamp
    cy.get(`.${cls('datepicker-input')}`).type('2019-09-18{Enter}');
    equalColumnData('date', '2019.09.18');
    compareColumnCellLength(3);
  });

  it('Not Equal', () => {
    cy.get('@thirdFilter').click();
    cy.get(`.${cls('filter-dropdown')} select`).select('ne');
    cy.get(`.${cls('filter-input')}`)
      .focus()
      .click();
    // 2019.09.18 timestamp
    cy.get(`.${cls('datepicker-input')}`).type('2019-09-18{Enter}');
    notEqualColumnData('date', '2019.09.18');
    compareColumnCellLength(6);
  });

  it('After', () => {
    cy.get('@thirdFilter').click();
    cy.get(`.${cls('filter-dropdown')} select`).select('after');
    cy.get(`.${cls('filter-input')}`)
      .focus()
      .click();
    // 2019.09.18 timestamp
    cy.get(`.${cls('datepicker-input')}`).type('2019-09-18{Enter}');
    cy.get(`[data-column-name=date]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(getUnixTime(elem.textContent) > getUnixTime('2019/09/18')).to.be.true;
      });
    });
    compareColumnCellLength(2);
  });

  it('After Equal', () => {
    cy.get('@thirdFilter').click();
    cy.get(`.${cls('filter-dropdown')} select`).select('afterEq');
    cy.get(`.${cls('filter-input')}`)
      .focus()
      .click();
    // 2019.09.18 timestamp
    cy.get(`.${cls('datepicker-input')}`).type('2019-09-18{Enter}');
    cy.get(`[data-column-name=date]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(getUnixTime(elem.textContent) >= getUnixTime('2019/09/18')).to.be.true;
      });
    });
    compareColumnCellLength(5);
  });

  it('Before', () => {
    cy.get('@thirdFilter').click();
    cy.get(`.${cls('filter-dropdown')} select`).select('before');
    cy.get(`.${cls('filter-input')}`)
      .focus()
      .click();
    // 2019.09.18 timestamp
    cy.get(`.${cls('datepicker-input')}`).type('2019-09-18{Enter}');
    cy.get(`[data-column-name=date]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(getUnixTime(elem.textContent) < getUnixTime('2019/09/18')).to.be.true;
      });
    });
    compareColumnCellLength(4);
  });

  it('Before Equal', () => {
    cy.get('@thirdFilter').click();
    cy.get(`.${cls('filter-dropdown')} select`).select('beforeEq');
    cy.get(`.${cls('filter-input')}`)
      .focus()
      .click();
    // 2019.09.18 timestamp
    cy.get(`.${cls('datepicker-input')}`).type('2019-09-18{Enter}');
    cy.get(`[data-column-name=date]td.${cls('cell')}`).should($el => {
      $el.each((index, elem) => {
        expect(getUnixTime(elem.textContent) <= getUnixTime('2019/09/18')).to.be.true;
      });
    });
    compareColumnCellLength(7);
  });
});
