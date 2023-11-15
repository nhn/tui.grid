import GridEvent from '@/event/gridEvent';
import { cls } from '@/helper/dom';
import { RowKey } from '@t/store/data';
import { SinonStub } from 'cypress/types/sinon';
import { invokeFilter } from '../helper/util';
import { ExportFormat } from '@t/store/export';

before(() => {
  cy.visit('/dist');
});

const DATA = [
  { name: 'Sugar', artist: 'Maroon5', price: 1000, typeCode: '2' },
  { name: 'Get Lucky', artist: 'Daft Punk', price: 2000, typeCode: '3' },
  { name: '21', artist: 'Adele', price: 3000, typeCode: '1' },
];
const COLUMNS = [
  {
    header: 'Name',
    name: 'name',
    filter: { type: 'text', showApplyBtn: true, showClearBtn: true },
  },
  {
    header: 'Artist',
    name: 'artist',
  },
  {
    header: 'Price',
    name: 'price',
    hidden: true,
  },
];

function showContextMenu(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).trigger('contextmenu');
}

function getMenuItemByText(text: string) {
  return cy.contains(`.${cls('context-menu')} .menu-item`, text);
}

function clickExportMenuItemByFormat(format: ExportFormat) {
  let text;

  switch (format) {
    case 'xlsx':
      text = 'Excel';
      break;
    case 'csv':
      text = 'CSV';
      break;
    default:
      text = 'Text';
  }

  showContextMenu(0, 'name');
  getMenuItemByText('Export').trigger('mouseenter');
  cy.contains(`.${cls('context-menu')} .menu-item`, text).click();
}

describe('Export data', () => {
  let callback: SinonStub;

  beforeEach(() => {
    cy.createGrid({ data: DATA, columns: COLUMNS });
    callback = cy.stub().callsFake((ev: GridEvent) => ev.stop());
    cy.gridInstance().invoke('on', 'beforeExport', callback);
  });

  afterEach(() => {
    cy.destroyGrid();
  });

  describe('Default options', () => {
    ['txt', 'csv', 'xlsx'].forEach((format) => {
      it(`should export data according to default export options to '${format}'`, () => {
        clickExportMenuItemByFormat(format as ExportFormat);

        cy.wrap(callback).should('be.calledWithMatch', {
          data: [
            ['Name', 'Artist'],
            ['Sugar', 'Maroon5'],
            ['Get Lucky', 'Daft Punk'],
            ['21', 'Adele'],
          ],
        });
      });
    });
  });

  describe('With complex column headers', () => {
    it(`should export data with complex column headers to 'txt'`, () => {
      cy.gridInstance().invoke('setHeader', {
        complexColumns: [
          {
            header: 'Basic',
            name: 'complexColumn',
            childNames: ['name', 'artist'],
          },
        ],
      });

      clickExportMenuItemByFormat('txt');

      cy.wrap(callback).should('be.calledWithMatch', {
        data: [
          ['Basic', 'Basic'],
          ['Name', 'Artist'],
          ['Sugar', 'Maroon5'],
          ['Get Lucky', 'Daft Punk'],
          ['21', 'Adele'],
        ],
      });
    });

    it(`should export data without column headers when with complex column headers to 'csv'`, () => {
      cy.gridInstance().invoke('setHeader', {
        complexColumns: [
          {
            header: 'Basic',
            name: 'complexColumn',
            childNames: ['name', 'artist'],
          },
        ],
      });

      clickExportMenuItemByFormat('csv');

      cy.wrap(callback).should('be.calledWithMatch', {
        data: [
          ['Sugar', 'Maroon5'],
          ['Get Lucky', 'Daft Punk'],
          ['21', 'Adele'],
        ],
      });
    });

    it(`should export data with complex column headers to 'xlsx'`, () => {
      cy.gridInstance().invoke('setHeader', {
        complexColumns: [
          {
            header: 'Basic',
            name: 'complexColumn',
            childNames: ['name', 'artist'],
          },
        ],
      });

      clickExportMenuItemByFormat('xlsx');

      cy.wrap(callback).should('be.calledWithMatch', {
        data: [
          ['Basic', 'Basic'],
          ['Name', 'Artist'],
          ['Sugar', 'Maroon5'],
          ['Get Lucky', 'Daft Punk'],
          ['21', 'Adele'],
        ],
      });
    });

    it(`should export data with complex column headers to 'xls'`, () => {
      cy.gridInstance().invoke('setHeader', {
        complexColumns: [
          {
            header: 'Basic',
            name: 'complexColumn',
            childNames: ['name', 'artist'],
          },
        ],
      });

      cy.gridInstance().invoke('export', 'xls');

      cy.wrap(callback).should('be.calledWithMatch', {
        data: [
          ['Basic', 'Basic'],
          ['Name', 'Artist'],
          ['Sugar', 'Maroon5'],
          ['Get Lucky', 'Daft Punk'],
          ['21', 'Adele'],
        ],
      });
    });
  });

  describe('Without column headers (includeHeader = false)', () => {
    ['txt', 'csv', 'xlsx', 'xls'].forEach((format) => {
      it(`should export data without column headers to '${format}'`, () => {
        cy.gridInstance().invoke('export', format, { includeHeader: false });

        cy.wrap(callback).should('be.calledWithMatch', {
          data: [
            ['Sugar', 'Maroon5'],
            ['Get Lucky', 'Daft Punk'],
            ['21', 'Adele'],
          ],
        });
      });
    });
  });

  describe('With hidden columns (includeHiddenColumns = true)', () => {
    ['txt', 'csv', 'xlsx', 'xls'].forEach((format) => {
      it(`should export data with hidden column to '${format}'`, () => {
        cy.gridInstance().invoke('export', format, { includeHiddenColumns: true });

        cy.wrap(callback).should('be.calledWithMatch', {
          data: [
            ['Name', 'Artist', 'Price'],
            ['Sugar', 'Maroon5', 1000],
            ['Get Lucky', 'Daft Punk', 2000],
            ['21', 'Adele', 3000],
          ],
        });
      });
    });
  });

  describe('With column names (columnNames = [...selectedColumnNames])', () => {
    ['txt', 'csv', 'xlsx', 'xls'].forEach((format) => {
      it(`should export data with selected columns to '${format}'`, () => {
        cy.gridInstance().invoke('export', format, { columnNames: ['name', 'price'] });

        cy.wrap(callback).should('be.calledWithMatch', {
          data: [
            ['Name', 'Price'],
            ['Sugar', 1000],
            ['Get Lucky', 2000],
            ['21', 3000],
          ],
        });
      });
    });
  });

  describe('With only filtered (onlyFiltered = true)', () => {
    ['txt', 'csv', 'xlsx', 'xls'].forEach((format) => {
      it(`should export only filtered data to '${format}'`, () => {
        invokeFilter('name', [{ code: 'eq', value: '21' }]);
        cy.gridInstance().invoke('export', format, { onlyFiltered: true });

        cy.wrap(callback).should('be.calledWithMatch', {
          data: [
            ['Name', 'Artist'],
            ['21', 'Adele'],
          ],
        });
      });
    });
  });

  describe('With only selected (onlySelected = true)', () => {
    describe('With selected range', () => {
      ['txt', 'csv', 'xlsx', 'xls'].forEach((format) => {
        it(`should export data of selected range to '${format}'`, () => {
          const range = { start: [0, 0], end: [1, 1] };
          cy.gridInstance().invoke('setSelectionRange', range);
          cy.gridInstance().invoke('export', format, { onlySelected: true });

          cy.wrap(callback).should('be.calledWithMatch', {
            data: [
              ['Name', 'Artist'],
              ['Sugar', 'Maroon5'],
              ['Get Lucky', 'Daft Punk'],
            ],
          });
        });

        it(`should export data of selected range to '${format}' regardless of "includeHiddenColumns" and "columnNames" options`, () => {
          const range = { start: [0, 0], end: [1, 1] };
          cy.gridInstance().invoke('setSelectionRange', range);
          cy.gridInstance().invoke('export', format, {
            includeHiddenColumns: true,
            columnNames: ['name'],
            onlySelected: true,
          });

          cy.wrap(callback).should('be.calledWithMatch', {
            data: [
              ['Name', 'Artist'],
              ['Sugar', 'Maroon5'],
              ['Get Lucky', 'Daft Punk'],
            ],
          });
        });

        it(`should export data of selected range to '${format}' according to "onlyFiltered" option`, () => {
          invokeFilter('name', [{ code: 'eq', value: '21' }]);

          const range = { start: [0, 0], end: [0, 0] };
          cy.gridInstance().invoke('setSelectionRange', range);

          cy.gridInstance().invoke('export', format, {
            onlyFiltered: true,
            onlySelected: true,
          });

          cy.wrap(callback).should('be.calledWithMatch', {
            data: [['Name'], ['21']],
          });
        });
      });
    });

    describe('Without selected range', () => {
      ['txt', 'csv', 'xlsx', 'xls'].forEach((format) => {
        it(`should export all visible data to '${format}' when no selected range`, () => {
          cy.gridInstance().invoke('export', format, { onlySelected: true });

          cy.wrap(callback).should('be.calledWithMatch', {
            data: [
              ['Name', 'Artist'],
              ['Sugar', 'Maroon5'],
              ['Get Lucky', 'Daft Punk'],
              ['21', 'Adele'],
            ],
          });
        });

        it(`should export data of selected columns to '${format}' when no selected range regardless of "includeHiddenColumns" option`, () => {
          cy.gridInstance().invoke('export', format, {
            includeHiddenColumns: true,
            columnNames: ['name'],
            onlySelected: true,
          });

          cy.wrap(callback).should('be.calledWithMatch', {
            data: [['Name'], ['Sugar'], ['Get Lucky'], ['21']],
          });
        });

        it(`should export data with hidden columns to '${format}' when no selected range and columns`, () => {
          cy.gridInstance().invoke('export', format, {
            includeHiddenColumns: true,
            onlySelected: true,
          });

          cy.wrap(callback).should('be.calledWithMatch', {
            data: [
              ['Name', 'Artist', 'Price'],
              ['Sugar', 'Maroon5', 1000],
              ['Get Lucky', 'Daft Punk', 2000],
              ['21', 'Adele', 3000],
            ],
          });
        });
      });
    });
  });

  describe('With custom delimiter (delimiter)', () => {
    it(`should export data with custom delimiter to 'csv'`, () => {
      cy.gridInstance().invoke('export', 'csv', { delimiter: ';' });

      cy.wrap(callback).should('be.calledWithMatch', {
        exportOptions: { delimiter: ';' },
      });
    });
  });

  describe('With custom file name (fileName)', () => {
    it(`should export data with custom file name to 'csv'`, () => {
      cy.gridInstance().invoke('export', 'csv', { fileName: 'myExport' });

      cy.wrap(callback).should('be.calledWithMatch', {
        exportOptions: { fileName: 'myExport' },
      });
    });
  });

  describe('useFormattedValue option', () => {
    beforeEach(() => {
      const formatColumn = [
        {
          header: 'Type',
          name: 'typeCode',
          formatter: 'listItemText',
          editor: {
            type: 'select',
            options: {
              listItems: [
                { text: 'Deluxe', value: '1' },
                { text: 'EP', value: '2' },
                { text: 'Single', value: '3' },
              ],
            },
          },
        },
      ];
      cy.gridInstance().invoke('setColumns', formatColumn);
    });

    ['txt', 'csv', 'xlsx', 'xls'].forEach((format) => {
      it(`should export formatted data to '${format}' (useFormattedValue = true)`, () => {
        cy.gridInstance().invoke('export', format, { useFormattedValue: true });

        cy.wrap(callback).should('be.calledWithMatch', {
          data: [['Type'], ['EP'], ['Single'], ['Deluxe']],
        });
      });

      it(`should export original data to '${format}' (useFormattedValue = false(default))`, () => {
        cy.gridInstance().invoke('export', format);

        cy.wrap(callback).should('be.calledWithMatch', {
          data: [['Type'], ['2'], ['3'], ['1']],
        });
      });
    });
  });
});
