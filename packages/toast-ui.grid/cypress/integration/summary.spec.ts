import { cls, dataAttr } from '../../src/helper/dom';
import { OptGrid, OptSummaryData, Dictionary } from '@t/options';
import { SummaryValueMap } from '@t/store/summary';
import { deepMergedCopy } from '../../src/helper/common';
import { clipboardType } from '../helper/util';

const CONTENT_WIDTH = 700;

const sampleData = [
  { name: 'Han', price: 1, downloadCount: 1 },
  { name: 'Ryu', price: 2, downloadCount: 2 },
  { name: 'Kim', price: 3, downloadCount: 3 },
  { name: 'Lee', price: 4, downloadCount: 4 },
  { name: 'Park', price: 5, downloadCount: 5 },
];

const filterSampleData = [
  { name: 'Han', price: 2, downloadCount: 1 },
  { name: 'Ryu', price: 3, downloadCount: 2 },
  { name: 'Kim', price: 2, downloadCount: 2 },
];

function createSummaryOption(
  customOptions: Record<string, unknown> = {},
  needDeepMergedCopy = false
) {
  const summary = {
    height: 40,
    columnContent: {
      price: {
        template(valueMap: SummaryValueMap) {
          const { filtered, max, min } = valueMap;
          return `MAX: ${max} FilteredMax: ${filtered.max}<br>MIN: ${min} FilteredMin: ${filtered.min}`;
        },
      },
      downloadCount: {
        template(valueMap: SummaryValueMap) {
          const { filtered, sum, avg } = valueMap;
          return `TOTAL: ${sum} FilteredSum: ${filtered.sum}<br>AVG: ${avg.toFixed(
            2
          )} FilteredAvg: ${filtered.avg.toFixed(2)}`;
        },
      },
    },
  };
  const summaryOptions = needDeepMergedCopy
    ? deepMergedCopy(summary, customOptions)
    : Object.assign(summary, customOptions);

  return summaryOptions as OptSummaryData;
}

function createDefaultOptions(customOptions?: Dictionary<any>): Omit<OptGrid, 'el'> {
  const data = sampleData.slice();
  const columns = [
    { name: 'name', minWidth: 150 },
    { name: 'price', minWidth: 150 },
    { name: 'downloadCount', minWidth: 150 },
  ];
  const summary = createSummaryOption();

  return { data, columns, summary, ...customOptions };
}

function assertSummaryContent(columnName: string, ...contents: string[]) {
  cy.get(`.${cls('cell-summary')}[${dataAttr.COLUMN_NAME}=${columnName}]`).as('summaryCell');
  contents.forEach((content) => {
    cy.get('@summaryCell').should('contain.text', content);
  });
}

function assertSummaryPosition(index: number, prevElClassName: string) {
  cy.getByCls('summary-area').eq(index).prev().should('have.class', prevElClassName);
}

function assertScrollLeft(alias: string, scrollLeft: number) {
  cy.get(alias).invoke('scrollLeft').should('be.eql', scrollLeft);
}

function assertSyncScrollLeft(index: number) {
  cy.getByCls('body-area').eq(index).as('bodyArea');

  cy.getByCls('summary-area').eq(index).as('summaryArea');

  cy.get('@summaryArea').scrollTo(50, 0);
  assertScrollLeft('@bodyArea', 50);

  cy.get('@bodyArea').scrollTo(100, 0);
  assertScrollLeft('@summaryArea', 100);
}

before(() => {
  cy.visit('/dist');
});

describe('summary', () => {
  it('no render when height is 0', () => {
    const defaultOptions = createDefaultOptions();
    const summary = createSummaryOption({ height: 0 });
    cy.createGrid({ ...defaultOptions, summary });

    cy.getByCls('summary-area').should('not.be.visible');
  });

  context('calculation', () => {
    it('auto calculate summary when position is bottom (default)', () => {
      const defaultOptions = createDefaultOptions();
      cy.createGrid(defaultOptions);

      assertSummaryContent('price', 'MAX: 5', 'MIN: 1');
      assertSummaryContent('downloadCount', 'TOTAL: 15', 'AVG: 3.00');
      assertSummaryPosition(0, cls('body-area'));
      assertSummaryPosition(1, cls('body-area'));
    });

    it('auto calculate summary when position is top', () => {
      const defaultOptions = createDefaultOptions();
      const summary = createSummaryOption({ position: 'top' });
      cy.createGrid({ ...defaultOptions, summary });

      assertSummaryContent('price', 'MAX: 5', 'MIN: 1');
      assertSummaryContent('downloadCount', 'TOTAL: 15', 'AVG: 3.00');
      assertSummaryPosition(0, cls('header-area'));
      assertSummaryPosition(1, cls('header-area'));
    });

    it('auto calculate summary when default content with template function', () => {
      const summary = createSummaryOption({
        defaultContent: {
          template(valueMap: SummaryValueMap) {
            return `total row count: ${valueMap.cnt}`;
          },
        },
      });
      const defaultOptions = createDefaultOptions();
      cy.createGrid({ ...defaultOptions, summary });

      assertSummaryContent('name', 'total row count: 5');
    });

    it('auto calculate summary when column is editable', () => {
      const options = createDefaultOptions();
      const columns = options.columns.map((column) => ({
        ...column,
        editor: 'text',
      }));
      cy.createGrid({ ...options, columns });

      cy.gridInstance().invoke('setValue', 1, 'price', 500000);

      assertSummaryContent('price', 'MAX: 500000', 'MIN: 1');
    });
  });

  context('static content', () => {
    it('should display static columnContent properly', () => {
      const summary = createSummaryOption({
        columnContent: {
          price: 'this is static',
        },
      });
      const defaultOptions = createDefaultOptions();
      cy.createGrid({ ...defaultOptions, summary });

      assertSummaryContent('price', 'this is static');
    });

    it('should display static defaultContent properly', () => {
      const summary = createSummaryOption({
        defaultContent: 'this is default',
      });
      const defaultOptions = createDefaultOptions();
      cy.createGrid({ ...defaultOptions, summary });

      assertSummaryContent('name', 'this is default');
      assertSummaryContent('price', 'MAX: 5', 'MIN: 1');
      assertSummaryContent('downloadCount', 'TOTAL: 15', 'AVG: 3.00');
    });

    it('should display static columnContent properly when useAutoSummary: false', () => {
      const summary = createSummaryOption(
        {
          columnContent: {
            price: {
              template(valueMap: SummaryValueMap) {
                return `no auto calculate: ${valueMap.sum}`;
              },
              useAutoSummary: false,
            },
          },
        },
        true
      );
      const defaultOptions = createDefaultOptions();
      cy.createGrid({ ...defaultOptions, summary });

      assertSummaryContent('price', 'no auto calculate: 0');
      assertSummaryContent('downloadCount', 'TOTAL: 15', 'AVG: 3.00');
    });
  });

  context('active scroll-x', () => {
    it('sync scrollLeft with body area', () => {
      const options = createDefaultOptions();
      const columns = options.columns.map((column) => ({ ...column, minWidth: 300 }));
      cy.createGrid({ ...options, columns });

      assertSyncScrollLeft(1);
    });

    it('sync scrollLeft with body area if column resizable: true', () => {
      const options = createDefaultOptions();
      const columns = options.columns.map((column) => ({ ...column, resizable: true }));
      cy.createGrid({ ...options, columns });

      cy.getByCls('column-resize-handle')
        .eq(0)
        .trigger('mousedown')
        .trigger('mousemove', { pageX: CONTENT_WIDTH })
        .trigger('mouseup');

      assertSyncScrollLeft(1);
    });
  });

  context('setSummaryColumnContent API', () => {
    it("change summary's value properly after changing existing summary column through setSummaryColumnContent()", () => {
      const defaultOptions = createDefaultOptions();
      cy.createGrid(defaultOptions);
      cy.gridInstance().invoke('setSummaryColumnContent', 'price', 'static content');
      assertSummaryContent('price', 'static content');

      cy.gridInstance().invoke('setSummaryColumnContent', 'price', {
        template(valueMap: SummaryValueMap) {
          return `auto calculate: ${valueMap.max}`;
        },
      });
      assertSummaryContent('price', 'auto calculate: 5');

      cy.gridInstance().invoke('setSummaryColumnContent', 'price', {
        template(valueMap: SummaryValueMap) {
          return `no auto calculate: ${valueMap.max}`;
        },
        useAutoSummary: false,
      });
      assertSummaryContent('price', 'no auto calculate: 0');
    });

    it("change summary's value properly after changing new summary column through setSummaryColumnContent()", () => {
      const defaultOptions = createDefaultOptions();
      cy.createGrid(defaultOptions);

      cy.gridInstance().invoke('setSummaryColumnContent', 'name', {
        template(valueMap: SummaryValueMap) {
          return `auto calculate: ${valueMap.sum}`;
        },
      });
      assertSummaryContent('name', 'auto calculate: 0');
    });

    it('summaryColumnContent is priority than defaultContent', () => {
      const summary = {
        height: 40,
        defaultContent: {
          template(valueMap: SummaryValueMap) {
            return `DEFAULT_MAX: ${valueMap.max}<br>DEFAULT_MIN: ${valueMap.min}`;
          },
        },
      };
      const defaultOptions = createDefaultOptions();
      cy.createGrid({ ...defaultOptions, summary });
      cy.gridInstance().invoke('setSummaryColumnContent', 'price', {
        template(valueMap: SummaryValueMap) {
          return `auto calculate: ${valueMap.max}`;
        },
      });

      assertSummaryContent('price', 'auto calculate: 5');
    });

    it('summaryColumnContent is applied after calling setColumns API', () => {
      const defaultOptions = createDefaultOptions();
      const columns = [
        { name: 'name', minWidth: 150 },
        { name: 'price', minWidth: 150 },
        { name: 'downloadCount', minWidth: 150 },
      ];
      cy.createGrid({ ...defaultOptions, columns: [] });

      cy.gridInstance().invoke('setColumns', columns);

      assertSummaryContent('price', 'MAX: 5', 'MIN: 1');
      assertSummaryContent('downloadCount', 'TOTAL: 15', 'AVG: 3.00');
    });

    it('summaryColumnContent is applied on manipulating the row after calling setColumns API', () => {
      const defaultOptions = createDefaultOptions();
      const columns = [
        { name: 'name', minWidth: 150 },
        { name: 'price', minWidth: 150 },
        { name: 'downloadCount', minWidth: 150 },
      ];
      cy.createGrid({ ...defaultOptions, columns: [] });

      cy.gridInstance().invoke('setColumns', columns);
      cy.gridInstance().invoke('appendRow', { name: 'TOAST', price: 6, downloadCount: 3 });

      assertSummaryContent('price', 'MAX: 6', 'MIN: 1');
      assertSummaryContent('downloadCount', 'TOTAL: 18', 'AVG: 3.00');
    });
  });

  it('return proper values when calls getSummaryValues() method', () => {
    const defaultOptions = createDefaultOptions();
    cy.createGrid(defaultOptions);

    cy.gridInstance().invoke('getSummaryValues', 'price').should('have.subset', {
      avg: 3,
      cnt: 5,
      max: 5,
      min: 1,
      sum: 15,
    });
  });

  it('should change summary value by resetData API', () => {
    const data = [
      { name: 100, price: 2, downloadCount: 10 },
      { name: 200, price: 5, downloadCount: 20 },
    ];
    const defaultOptions = createDefaultOptions();
    cy.createGrid(defaultOptions);
    cy.gridInstance().invoke('resetData', data);

    cy.gridInstance().invoke('getSummaryValues', 'price').should('have.subset', {
      avg: 3.5,
      cnt: 2,
      max: 5,
      min: 2,
      sum: 7,
    });
  });

  context('should change summary value by appendRow / removeRow API', () => {
    it('appendRow API', () => {
      const row = { name: 'TOAST', price: 6, downloadCount: 3 };
      const defaultOptions = createDefaultOptions();
      cy.createGrid(defaultOptions);
      cy.gridInstance().invoke('appendRow', row);

      cy.gridInstance().invoke('getSummaryValues', 'price').should('have.subset', {
        avg: 3.5,
        cnt: 6,
        max: 6,
        min: 1,
        sum: 21,
      });

      cy.gridInstance().invoke('getSummaryValues', 'downloadCount').should('have.subset', {
        avg: 3,
        cnt: 6,
        max: 5,
        min: 1,
        sum: 18,
      });
    });

    it('removeRow API', () => {
      const defaultOptions = createDefaultOptions();
      cy.createGrid(defaultOptions);
      cy.gridInstance().invoke('removeRow', 19);

      cy.gridInstance().invoke('getSummaryValues', 'price').should('have.subset', {
        avg: 3,
        cnt: 5,
        max: 5,
        min: 1,
        sum: 15,
      });

      cy.gridInstance().invoke('getSummaryValues', 'downloadCount').should('have.subset', {
        avg: 3,
        cnt: 5,
        max: 5,
        min: 1,
        sum: 15,
      });
    });
  });

  it('should change summary value by setColumnValues API', () => {
    const defaultOptions = createDefaultOptions();
    cy.createGrid(defaultOptions);
    cy.gridInstance().invoke('setColumnValues', 'price', 10);

    cy.gridInstance().invoke('getSummaryValues', 'price').should('have.subset', {
      avg: 10,
      cnt: 5,
      max: 10,
      min: 10,
      sum: 50,
    });
  });

  it('should change summary value by clear API', () => {
    const defaultOptions = createDefaultOptions();
    cy.createGrid(defaultOptions);
    cy.gridInstance().invoke('clear');

    cy.gridInstance().invoke('getSummaryValues', 'price').should('have.subset', {
      avg: 0,
      cnt: 0,
      max: 0,
      min: 0,
      sum: 0,
    });
  });

  it(`should apply summary option on columns that doesn't exist`, () => {
    const defaultOptions = createDefaultOptions();
    const columns = [
      { name: 'name', minWidth: 150 },
      { name: 'artist', minWidth: 150 },
      { name: 'type', minWidth: 150 },
    ];
    cy.createGrid({ ...defaultOptions, columns });
    cy.gridInstance().invoke('getSummaryValues', 'price').should('have.subset', {
      avg: 3,
      cnt: 5,
      max: 5,
      min: 1,
      sum: 15,
    });
  });

  describe('Keyboard', () => {
    ['backspace', 'del'].forEach((key) => {
      it(`should change summary by delete with passing ${key}`, () => {
        const defaultOptions = createDefaultOptions({
          columns: [
            { name: 'name', editor: 'text' },
            { name: 'price', editor: 'text' },
            { name: 'downloadCount', editor: 'text' },
          ],
        });
        cy.createGrid(defaultOptions);

        cy.getCellByIdx(0, 1).click();
        clipboardType(`{${key}}`);

        cy.gridInstance().invoke('getSummaryValues', 'price').should('have.subset', {
          avg: 2.8,
          cnt: 5,
          max: 5,
          min: 0,
          sum: 14,
        });
      });
    });
  });
});

describe('summary with filter', () => {
  beforeEach(() => {
    const defaultOptions = createDefaultOptions({
      columns: [
        { name: 'name', minWidth: 150, editor: 'text' },
        { name: 'price', minWidth: 150, sortable: true, editor: 'text' },
        { name: 'downloadCount', minWidth: 150, filter: 'number', editor: 'text' },
      ],
    });
    cy.createGrid({ ...defaultOptions, data: filterSampleData });
    cy.gridInstance().invoke('filter', 'downloadCount', [{ code: 'eq', value: 2 }]);
  });

  it('should change summary when changes value if no filter is set', () => {
    cy.gridInstance().invoke('unfilter', 'downloadCount');
    cy.gridInstance().invoke('setValue', 0, 'downloadCount', 2);

    cy.gridInstance()
      .invoke('getSummaryValues', 'downloadCount')
      .should('have.deep.property', 'filtered', { sum: 6, min: 2, max: 2, avg: 2, cnt: 3 });
  });

  it('should change summary based on the filtering result.', () => {
    assertSummaryContent(
      'downloadCount',
      'TOTAL: 5',
      'AVG: 1.67',
      'FilteredSum: 4',
      'FilteredAvg: 2.00'
    );
  });

  it('should change summary when changes value', () => {
    cy.gridInstance().invoke('setValue', 0, 'downloadCount', 1);
    assertSummaryContent(
      'downloadCount',
      'TOTAL: 5',
      'AVG: 1.67',
      'FilteredSum: 4',
      'FilteredAvg: 2.00'
    );
  });

  context('setRow', () => {
    it('should not change filtered summary when replaces the row(not having filtered value)', () => {
      cy.gridInstance().invoke('setRow', 0, { name: 'test', price: 1, downloadCount: 3 });
      assertSummaryContent(
        'downloadCount',
        'TOTAL: 7',
        'AVG: 2.33',
        'FilteredSum: 4',
        'FilteredAvg: 2.00'
      );
    });

    it('should change filtered summary when replaces the row(having filtered value)', () => {
      cy.gridInstance().invoke('setRow', 0, { name: 'test', price: 30, downloadCount: 2 });
      assertSummaryContent(
        'downloadCount',
        'TOTAL: 6',
        'AVG: 2.00',
        'FilteredSum: 6',
        'FilteredAvg: 2.00'
      );
    });
  });

  context('appendRow', () => {
    it('should not change filtered summary when appends row(not having filtered value)', () => {
      cy.gridInstance().invoke('appendRow', { name: 'test', price: 1, downloadCount: 3 });
      assertSummaryContent(
        'downloadCount',
        'TOTAL: 8',
        'AVG: 2.00',
        'FilteredSum: 4',
        'FilteredAvg: 2.00'
      );
    });

    it('should not change filtered summary when appends row(having filtered value)', () => {
      cy.gridInstance().invoke('appendRow', { name: 'test', price: 30, downloadCount: 2 });
      assertSummaryContent(
        'downloadCount',
        'TOTAL: 7',
        'AVG: 1.75',
        'FilteredSum: 6',
        'FilteredAvg: 2.00'
      );
    });
  });

  context('removeRow', () => {
    it('should not change summary when removes row(not having filtered value)', () => {
      cy.gridInstance().invoke('removeRow', 0);
      assertSummaryContent(
        'downloadCount',
        'TOTAL: 4',
        'AVG: 2.00',
        'FilteredSum: 4',
        'FilteredAvg: 2.00'
      );
    });

    it('should change summary when removes row(having filtered value)', () => {
      cy.gridInstance().invoke('removeRow', 1);
      assertSummaryContent(
        'downloadCount',
        'TOTAL: 3',
        'AVG: 1.50',
        'FilteredSum: 2',
        'FilteredAvg: 2.00'
      );
    });
  });
});

describe('summary with pagination', () => {
  beforeEach(() => {
    const defaultOptions = createDefaultOptions({
      columns: [
        { name: 'name', minWidth: 150 },
        { name: 'price', minWidth: 150, sortable: true },
        { name: 'downloadCount', minWidth: 150, filter: 'number' },
      ],
    });
    cy.createGrid({ ...defaultOptions, pageOptions: { useClient: true, perPage: 10 } });
  });

  it('should not change summary when moving page', () => {
    assertSummaryContent('price', 'MAX: 5', 'MIN: 1');
    assertSummaryContent('downloadCount', 'TOTAL: 15', 'AVG: 3.00');

    cy.get(`.tui-page-btn.tui-last-child`).click();

    assertSummaryContent('price', 'MAX: 5', 'MIN: 1');
    assertSummaryContent('downloadCount', 'TOTAL: 15', 'AVG: 3.00');
  });
});
