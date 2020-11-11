import { clipboardType } from '../helper/util';

export {};

interface Data {
  name: string;
  age: number | string;
}

interface ModifiedRowsLengthMap {
  createdRows: number;
  updatedRows: number;
  deletedRows: number;
}

interface ModifiedRowsMap {
  createdRows?: Data[];
  updatedRows?: Data[];
  deletedRows?: Data[];
}

const data = [
  { name: 'Kim', age: 10 },
  { name: 'Lee', age: 20 },
];
const columns = [
  { name: 'name', editor: 'text' },
  { name: 'age', editor: 'text' },
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.createGrid({ data, columns });
});

function assertModifiedRowsLength(lengthMap: ModifiedRowsLengthMap) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .should((rows) => {
      Object.keys(rows).forEach((type) => {
        expect(rows[type]).to.have.length(lengthMap[type as keyof ModifiedRowsLengthMap]);
      });
    });
}

function assertModifiedRowsContainsObject(modifiedRowsMap: ModifiedRowsMap) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .should((rows) => {
      Object.keys(modifiedRowsMap).forEach((type) => {
        expect(rows[type][0]).to.contain(modifiedRowsMap[type as keyof ModifiedRowsMap]![0]);
      });
    });
}

it('should add new row to createdRows property after appending a row', () => {
  cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });

  assertModifiedRowsLength({ createdRows: 1, updatedRows: 0, deletedRows: 0 });
  assertModifiedRowsContainsObject({ createdRows: [{ name: 'Park', age: 30 }] });
});

it('should not add the created row to updatedRows, regardless of modifying it', () => {
  cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });
  cy.gridInstance().invoke('setValue', 2, 'name', 'RYU');

  assertModifiedRowsLength({ createdRows: 1, updatedRows: 0, deletedRows: 0 });
  assertModifiedRowsContainsObject({ createdRows: [{ name: 'RYU', age: 30 }] });
});

describe('update rows', () => {
  it('should add updated row, when row is modified by setValue API', () => {
    cy.gridInstance().invoke('setValue', 0, 'name', 'RYU');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 1, deletedRows: 0 });
    assertModifiedRowsContainsObject({ updatedRows: [{ name: 'RYU', age: 10 }] });
  });

  it('should add updated row, when row is modified by setRow API', () => {
    cy.gridInstance().invoke('setRow', 0, { name: 'JIN', age: 10 });

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 1, deletedRows: 0 });
    assertModifiedRowsContainsObject({ updatedRows: [{ name: 'JIN', age: 10 }] });
  });

  it('should add updated row, when row is modified by setColumnValues API', () => {
    cy.gridInstance().invoke('setColumnValues', 'name', 'Park');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 2, deletedRows: 0 });
    assertModifiedRowsContainsObject({
      updatedRows: [
        { name: 'Park', age: 10 },
        { name: 'Park', age: 20 },
      ],
    });
  });

  it('should not add duplicated row to updatedRows by calling setValue many times', () => {
    cy.gridInstance().invoke('setValue', 0, 'name', 'RYU');
    cy.gridInstance().invoke('setValue', 0, 'name', 'JIN');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 1, deletedRows: 0 });
    assertModifiedRowsContainsObject({ updatedRows: [{ name: 'JIN', age: 10 }] });
  });

  it('should not add duplicated row to updatedRows by calling setRow many times', () => {
    cy.gridInstance().invoke('setRow', 0, { name: 'Park', age: 30 });
    cy.gridInstance().invoke('setRow', 0, { name: 'JIN', age: 10 });

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 1, deletedRows: 0 });
    assertModifiedRowsContainsObject({ updatedRows: [{ name: 'JIN', age: 10 }] });
  });

  it('should not add duplicated row to updatedRows by calling setColumnValues many times', () => {
    cy.gridInstance().invoke('setColumnValues', 'name', 'Park');
    cy.gridInstance().invoke('setColumnValues', 'name', 'Kim');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 2, deletedRows: 0 });
    assertModifiedRowsContainsObject({
      updatedRows: [
        { name: 'Kim', age: 10 },
        { name: 'Kim', age: 20 },
      ],
    });
  });

  ['backspace', 'del'].forEach((key) => {
    it(`should add updated row, when focused row is modified by ${key} keyMap`, () => {
      cy.getCellByIdx(0, 0).click();
      clipboardType(`{${key}}`);

      assertModifiedRowsLength({ createdRows: 0, updatedRows: 1, deletedRows: 0 });
      assertModifiedRowsContainsObject({ updatedRows: [{ name: '', age: 10 }] });
    });

    it(`should add updated row, when rows in selection are modified by ${key} keyMap`, () => {
      cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [1, 1] });
      clipboardType(`{${key}}`);

      assertModifiedRowsLength({ createdRows: 0, updatedRows: 2, deletedRows: 0 });
      assertModifiedRowsContainsObject({
        updatedRows: [
          { name: '', age: '' },
          { name: '', age: '' },
        ],
      });
    });
  });
});

it('should add deleted row to only deletedRows property, regardless of modifying it before', () => {
  cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });
  cy.gridInstance().invoke('setValue', 2, 'age', 20);
  cy.gridInstance().invoke('setValue', 0, 'name', 'RYU');
  cy.gridInstance().invoke('setValue', 0, 'name', 'JIN');
  cy.gridInstance().invoke('removeRow', 0);
  cy.gridInstance().invoke('removeRow', 2);

  assertModifiedRowsLength({ createdRows: 0, updatedRows: 0, deletedRows: 1 });
  assertModifiedRowsContainsObject({ deletedRows: [{ name: 'JIN', age: 10 }] });
});

describe('clearModifiedData API', () => {
  beforeEach(() => {
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });
    cy.gridInstance().invoke('setValue', 0, 'name', 'JIN');
    cy.gridInstance().invoke('removeRow', 1);
  });

  it('should clear the specific modified data', () => {
    assertModifiedRowsLength({ createdRows: 1, updatedRows: 1, deletedRows: 1 });

    cy.gridInstance().invoke('clearModifiedData', 'CREATE');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 1, deletedRows: 1 });

    cy.gridInstance().invoke('clearModifiedData', 'UPDATE');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 0, deletedRows: 1 });

    cy.gridInstance().invoke('clearModifiedData', 'DELETE');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 0, deletedRows: 0 });
  });

  it('should clear the all modified data', () => {
    assertModifiedRowsLength({ createdRows: 1, updatedRows: 1, deletedRows: 1 });

    cy.gridInstance().invoke('clearModifiedData');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 0, deletedRows: 0 });
  });
});

describe('clear all modified data', () => {
  beforeEach(() => {
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });
    cy.gridInstance().invoke('setValue', 0, 'name', 'JIN');
    cy.gridInstance().invoke('removeRow', 1);
  });

  it('should clear all modified data after calling resetData API', () => {
    assertModifiedRowsLength({ createdRows: 1, updatedRows: 1, deletedRows: 1 });

    cy.gridInstance().invoke('resetData', [{ name: 'Lee', age: 30 }]);

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 0, deletedRows: 0 });
  });

  it('should clear all modified data after calling clear API', () => {
    assertModifiedRowsLength({ createdRows: 1, updatedRows: 1, deletedRows: 1 });

    cy.gridInstance().invoke('clear');

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 0, deletedRows: 0 });
  });
});
