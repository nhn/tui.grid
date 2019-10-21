/// <reference path="../../node_modules/cypress/types/sinon/index.d.ts" />
/// <reference path="../../node_modules/cypress-plugin-tab/src/index.d.ts" />
/// <reference path="../../types/tui-pagination/index.d.ts" />
/// <reference path="../../types/tui-date-picker/index.d.ts" />
/// <reference types="cypress" />

// @TODO: remove the 'skipLibCheck' option in cypress/tsconfig.json
// related issue: https://github.com/cypress-io/cypress/issues/5065
declare namespace Cypress {
  interface Chainable<Subject> {
    (chainer: 'be.subset'): Chainable<Subject>;
    (chainer: 'be.foo'): Chainable<Subject>;

    getCell(rowKey: number | string, column: string): Chainable<any>;

    getCellByIdx(rowIdx: number, columnIdx: number): Chainable<any>;

    getCellContent(rowKey: number | string, column: string): Chainable<any>;

    getByCls(className: string): Chainable<any>;

    createGrid(gridOptions: any, elementStyles?: any): Chainable<any>;

    createStyle(style: string): Chainable<any>;

    gridInstance(): Chainable<any>;

    stub(): Agent<sinon.SinonStub> & sinon.SinonStub;
  }
}

declare namespace Chai {
  interface Include {
    subset(subset: any): Assertion;
  }
}
