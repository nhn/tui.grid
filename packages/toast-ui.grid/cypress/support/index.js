// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import 'cypress-plugin-tab';
import './commands';
import { isSubsetOf } from '../helper/compare';
import { cls } from '@/helper/dom';

afterEach(() => {
  cy.destroyGrid();
});

chai.use((_chai) => {
  _chai.Assertion.addMethod('subset', function (options) {
    new _chai.Assertion(isSubsetOf(options, this._obj)).to.be.true;
  });

  _chai.Assertion.addMethod('cellData', function (cellData) {
    const table = this._obj[0];

    new _chai.Assertion(table).to.be.exist;

    const actual = [...table.querySelectorAll('tr')].map((row) =>
      [...row.getElementsByClassName(cls('cell-content'))].map((cell) => cell.textContent)
    );

    new _chai.Assertion(actual).to.be.eql(cellData);
  });

  _chai.Assertion.addMethod('headerData', function (headerData) {
    const table = this._obj[0];

    new _chai.Assertion(table).to.be.exist;

    const actual = [...table.querySelectorAll('tr')].map((row) =>
      [...row.querySelectorAll('th')].map((cell) => cell.textContent)
    );

    new _chai.Assertion(actual).to.be.eql(headerData);
  });

  _chai.Assertion.addMethod('sameColumnData', function (columnData) {
    new _chai.Assertion(columnData).to.be.exist;
    const cells = this._obj;

    const actual = [...cells].map((cell) => cell.textContent);
    const values = [...cells].map(() => columnData);

    new _chai.Assertion(actual).to.be.eql(values);
  });

  _chai.Assertion.addMethod('columnData', function (columnData) {
    new _chai.Assertion(columnData).to.be.exist;
    const cells = this._obj;

    new _chai.Assertion(cells.length).to.be.eql(columnData.length);

    const actual = [...cells].map((cell) => cell.textContent);

    new _chai.Assertion(actual).to.be.eql(columnData);
  });
});
