import { Omit } from 'utility-types';
import { cls, dataAttr } from '../../src/helper/dom';
import { data as sampleData } from '../../samples/basic';
import Grid from '../../src/grid';
import { OptGrid, OptSummaryData, OptSummaryValueMap } from '../../src/types';
import { deepMergedCopy } from '../../src/helper/common';

interface GridGlobal {
  tui: { Grid: typeof Grid };
  grid: Grid;
}

const CONTENT_WIDTH = 700;
// @TODO: Retrieve scrollbar-width from real browser
const SCROLLBAR_WIDTH = 17;

function createSummaryOption(
  customOptions: Record<string, unknown> = {},
  needDeepMergedCopy: boolean = false
) {
  const summary = {
    height: 40,
    columnContent: {
      price: {
        template(valueMap: OptSummaryValueMap) {
          return `MAX: ${valueMap.max}<br>MIN: ${valueMap.min}`;
        }
      },
      downloadCount: {
        template(valueMap: OptSummaryValueMap) {
          return `TOTAL: ${valueMap.sum}<br>AVG: ${valueMap.avg.toFixed(2)}`;
        }
      }
    }
  };
  const summaryOptions = needDeepMergedCopy
    ? deepMergedCopy(summary, customOptions)
    : Object.assign(summary, customOptions);

  return summaryOptions as OptSummaryData;
}

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  const data = sampleData.slice();
  const columns = [
    { name: 'name', minWidth: 150 },
    { name: 'price', minWidth: 150 },
    { name: 'downloadCount', minWidth: 150 }
  ];
  const summary = createSummaryOption();

  return { data, columns, summary };
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

function assertSummaryContent(columnName: string, ...contents: string[]) {
  cy.get(`.${cls('cell-summary')}[${dataAttr.COLUMN_NAME}=${columnName}]`).as('summaryCell');
  contents.forEach((content) => {
    cy.get('@summaryCell').contains(content);
  });
}

function assertSummaryPosition(index: number, prevElClassName: string) {
  cy.get(`.${cls('summary-area')}`)
    .eq(index)
    .prev()
    .should('have.class', prevElClassName);
}

function assertScrollLeft(alias: string, scrollLeft: number) {
  cy.get(alias)
    .invoke('scrollLeft')
    .should('be.eql', scrollLeft);
}

function assertSyncScrollLeft(index: number) {
  cy.get(`.${cls('body-area')}`)
    .eq(index)
    .as('bodyArea');

  cy.get(`.${cls('summary-area')}`)
    .eq(index)
    .as('summaryArea');

  cy.get('@summaryArea').scrollTo(50, 0);
  assertScrollLeft('@bodyArea', 50);

  cy.get('@bodyArea').scrollTo(100, 0);
  assertScrollLeft('@summaryArea', 100);
}

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

describe('summary', () => {
  beforeEach(() => {
    cy.document().then((doc) => {
      doc.body.innerHTML = '';
    });
  });

  it('no render when height is 0', () => {
    const summary = createSummaryOption({ height: 0 });
    createGrid({ summary });

    cy.get(`.${cls('container')}`).should(($container) => {
      expect($container.find(`.${cls('summary-area')}`)).not.to.exist;
    });
  });

  context('calculation', () => {
    it('auto calculate summary when position is bottom (default)', () => {
      createGrid();
      assertSummaryContent('price', 'MAX: 30000', 'MIN: 6000');
      assertSummaryContent('downloadCount', 'TOTAL: 20000', 'AVG: 1000.00');
      assertSummaryPosition(0, cls('body-area'));
      assertSummaryPosition(1, cls('body-area'));
    });

    it('auto calculate summary when position is top', () => {
      const summary = createSummaryOption({ position: 'top' });
      createGrid({ summary });
      assertSummaryContent('price', 'MAX: 30000', 'MIN: 6000');
      assertSummaryContent('downloadCount', 'TOTAL: 20000', 'AVG: 1000.00');
      assertSummaryPosition(0, cls('header-area'));
      assertSummaryPosition(1, cls('header-area'));
    });

    it('auto calculate summary when default content with template function', () => {
      const summary = createSummaryOption({
        defaultContent: {
          template(valueMap: OptSummaryValueMap) {
            return `auto calculate: ${valueMap.sum}`;
          }
        }
      });
      createGrid({ summary });
      assertSummaryContent('name', 'auto calculate: 25');
    });

    it('auto calculate summary when column is editable', () => {
      const options = createDefaultOptions();
      const columns = options.columns.map((column) => ({
        ...column,
        editor: 'text'
      }));
      createGrid({ columns });

      cy.get(`.${cls('container')}`)
        .trigger('mousedown')
        .trigger('dblclick')
        .within(() => {
          cy.get(`.${cls('layer-editing')} input`).type('500000{enter}');
          assertSummaryContent('price', 'MAX: 500000', 'MIN: 6000');
        });
    });
  });

  context('static content', () => {
    it('should display static columnContent properly', () => {
      const summary = createSummaryOption({
        columnContent: {
          price: 'this is static'
        }
      });
      createGrid({ summary });
      assertSummaryContent('price', 'this is static');
    });

    it('should display static defaultContent properly', () => {
      const summary = createSummaryOption({
        defaultContent: 'this is default'
      });
      createGrid({ summary });
      assertSummaryContent('name', 'this is default');
      assertSummaryContent('price', 'MAX: 30000', 'MIN: 6000');
      assertSummaryContent('downloadCount', 'TOTAL: 20000', 'AVG: 1000.00');
    });

    it('should display static columnContent properly when useAutoSummary: false', () => {
      const summary = createSummaryOption(
        {
          columnContent: {
            price: {
              template(valueMap: OptSummaryValueMap) {
                return `no auto calculate: ${valueMap.sum}`;
              },
              useAutoSummary: false
            }
          }
        },
        true
      );
      createGrid({ summary });
      assertSummaryContent('price', 'no auto calculate: 0');
      assertSummaryContent('downloadCount', 'TOTAL: 20000', 'AVG: 1000.00');
    });
  });

  context('active scroll-x', () => {
    it('sync scrollLeft with body area', () => {
      const options = createDefaultOptions();
      const columns = options.columns.map((column) => ({ ...column, minWidth: 300 }));
      createGrid({ columns });

      assertSyncScrollLeft(1);
    });

    it('sync scrollLeft with body area if column resizable: true', () => {
      const options = createDefaultOptions();
      const columns = options.columns.map((column) => ({ ...column, resizable: true }));
      createGrid({ columns });

      cy.get(`.${cls('column-resize-handle')}`)
        .eq(0)
        .trigger('mousedown')
        .trigger('mousemove', { pageX: CONTENT_WIDTH })
        .trigger('mouseup');

      assertSyncScrollLeft(1);
    });
  });

  it("change summary's value properly after call setSummaryColumnContent()", () => {
    createGrid();
    cy.gridInstance().invoke('setSummaryColumnContent', 'price', 'static content');
    assertSummaryContent('price', 'static content');

    cy.gridInstance().invoke('setSummaryColumnContent', 'price', {
      template(valueMap: OptSummaryValueMap) {
        return `auto calculate: ${valueMap.max}`;
      }
    });
    assertSummaryContent('price', 'auto calculate: 30000');

    cy.gridInstance().invoke('setSummaryColumnContent', 'price', {
      template(valueMap: OptSummaryValueMap) {
        return `no auto calculate: ${valueMap.max}`;
      },
      useAutoSummary: false
    });
    assertSummaryContent('price', 'no auto calculate: 0');

    cy.gridInstance().invoke('setSummaryColumnContent', 'name', {
      template(valueMap: OptSummaryValueMap) {
        return `auto calculate: ${valueMap.sum}`;
      }
    });
    assertSummaryContent('name', 'auto calculate: 25');
    assertSummaryContent('downloadCount', 'TOTAL: 20000', 'AVG: 1000.00');
  });

  it('return prpper values when calls getSummaryValues() method', () => {
    createGrid();
    cy.gridInstance()
      .invoke('getSummaryValues', 'price')
      .should((summaryValues) => {
        expect(summaryValues).to.be.eql({
          avg: 13750,
          cnt: 20,
          max: 30000,
          min: 6000,
          sum: 275000
        });
      });
  });
});
