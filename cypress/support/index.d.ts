/// <reference path="../../node_modules/cypress/types/sinon/index.d.ts" />
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    getCell(rowKey: number | string, column: string): Chainable<any>;

    getCellByIdx(rowIdx: number, columnIdx: number): Chainable<any>;

    getCellContent(rowKey: number | string, column: string): Chainable<any>;

    createGrid(gridOptions: any, elementStyles?: any): Chainable<any>;

    createStyle(style: string): Chainable<any>;

    gridInstance(): Chainable<any>;

    stub(): Agent<sinon.SinonStub> & sinon.SinonStub;
  }
}
