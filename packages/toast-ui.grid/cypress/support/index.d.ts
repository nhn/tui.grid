/// <reference path="../../node_modules/cypress-plugin-tab/src/index.d.ts" />

declare namespace Cypress {
  type RowHeaderType = '_checked' | '_number' | '_draggable';
  type RowKey = number | string;

  interface Chainable<Subject> {
    getCell(rowKey: RowKey, column: string): Chainable<any>;

    getCellByIdx(rowIdx: number, columnIdx: number): Chainable<any>;

    getByCls(...classNames: string[]): Chainable<any>;

    getCellData(): Chainable<any>;

    createGrid(gridOptions: any, elementStyles?: any, parentEl?: HTMLElement): Chainable<any>;

    createStyle(style: string): Chainable<any>;

    gridInstance(): Chainable<any>;

    stub(): Agent<sinon.SinonStub> & sinon.SinonStub;

    getHeaderCell(column: string): Chainable<any>;

    getRowHeaderCell(rowKey: RowKey, columnName: RowHeaderType): Chainable<any>;

    getRowHeaderInput(rowKey: RowKey): Chainable<any>;

    getRowHeaderCells(columnName: RowHeaderType): Chainable<any>;

    getColumnCells(columnName: string): Chainable<any>;

    getRow(rowKey: RowKey): Chainable<any>;

    getCells(rowKey: RowKey): Chainable<any>;

    getRsideBody(): Chainable<any>;

    getRsideHeader(): Chainable<any>;

    dragColumnResizeHandle(index: number, distance: number): Chainable<any>;

    getBodyCells(): Chainable<any>;

    focusAndWait(rowKey: RowKey, columnName: string): Chainable<any>;

    destroyGrid(): Chainable<any>;
  }
}

declare namespace Chai {
  interface Include {
    subset(subset: any): Assertion;
  }
}
