import GridEvent from '@/event/gridEvent';
import { cls } from '@/helper/dom';
import { RowKey } from '@t/store/data';
import { SinonStub } from 'cypress/types/sinon';
import { invokeFilter, setSelectionUsingMouse } from '../helper/util';

before(() => {
  cy.visit('/dist');
});

function showContextMenu(rowKey: RowKey, columnName: string) {
  cy.getCell(rowKey, columnName).trigger('contextmenu');
}

function getMenuItemByText(text: string) {
  return cy.contains(`.${cls('context-menu')} .menu-item`, text);
}

function formatToType(format: string) {
  if (format === 'csv') {
    return 'CSV';
  }
  return 'Excel';
}

describe('Export data', () => {
  const data = [
    { name: 'Sugar', artist: 'Maroon5', price: 1000 },
    { name: 'Get Lucky', artist: 'Daft Punk', price: 2000 },
    { name: '21', artist: 'Adele', price: 3000 },
  ];
  const columns = [
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

  let callback: SinonStub;

  beforeEach(() => {
    cy.createGrid({ data, columns });
    callback = cy.stub().callsFake((ev: GridEvent) => {
      ev.stop();
    });
  });

  afterEach(() => {
    cy.destroyGrid();
  });

  describe('Default options', () => {
    ['csv', 'xlsx'].forEach((format) => {
      it(`should export data according to defulat export options to '${format}'`, () => {
        cy.gridInstance().invoke('on', 'beforeExport', callback);

        showContextMenu(0, 'name');
        getMenuItemByText('Export').trigger('mouseenter');
        getMenuItemByText(`${formatToType(format)} Export`).click();

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

      cy.gridInstance().invoke('on', 'beforeExport', callback);

      showContextMenu(0, 'name');
      getMenuItemByText('Export').trigger('mouseenter');
      getMenuItemByText('CSV Export').click();

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

      cy.gridInstance().invoke('on', 'beforeExport', callback);

      showContextMenu(0, 'name');
      getMenuItemByText('Export').trigger('mouseenter');
      getMenuItemByText('Excel Export').click();

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

  describe('Without column headers', () => {
    ['csv', 'xlsx'].forEach((format) => {
      it(`should export data without column headers to '${format}'`, () => {
        cy.gridInstance().invoke('on', 'beforeExport', callback);
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

  describe('With hidden columns', () => {
    ['csv', 'xlsx'].forEach((format) => {
      it(`should export data with hidden column to '${format}'`, () => {
        cy.gridInstance().invoke('on', 'beforeExport', callback);
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

  describe('With column names', () => {
    ['csv', 'xlsx'].forEach((format) => {
      it(`should export data with selected columns to '${format}'`, () => {
        cy.gridInstance().invoke('on', 'beforeExport', callback);
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

  describe('With only selected', () => {
    ['csv', 'xlsx'].forEach((format) => {
      it(`should export data of selected range to '${format}'`, () => {
        cy.gridInstance().invoke('on', 'beforeExport', callback);
        setSelectionUsingMouse([0, 0], [1, 1]);
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
        cy.gridInstance().invoke('on', 'beforeExport', callback);
        setSelectionUsingMouse([0, 0], [1, 1]);
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

      it(`should export all visible data to '${format}' when no selected range`, () => {
        cy.gridInstance().invoke('on', 'beforeExport', callback);
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
        cy.gridInstance().invoke('on', 'beforeExport', callback);
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
        cy.gridInstance().invoke('on', 'beforeExport', callback);
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

  describe('With only filtered data', () => {
    ['csv', 'xlsx'].forEach((format) => {
      it(`should export only filtered data to '${format}'`, () => {
        cy.gridInstance().invoke('on', 'beforeExport', callback);
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

  describe('With custom delimiter', () => {
    it(`should export data with custom delimiter to 'csv'`, () => {
      cy.gridInstance().invoke('on', 'beforeExport', callback);
      cy.gridInstance().invoke('export', 'csv', { delimiter: ';' });

      cy.wrap(callback).should('be.calledWithMatch', {
        exportOptions: { delimiter: ';' },
      });
    });
  });

  describe('With custom file name', () => {
    it(`should export data with custom file name to 'csv'`, () => {
      cy.gridInstance().invoke('on', 'beforeExport', callback);
      cy.gridInstance().invoke('export', 'csv', { fileName: 'myExport' });

      cy.wrap(callback).should('be.calledWithMatch', {
        exportOptions: { fileName: 'myExport' },
      });
    });
  });
});
