export {};

interface Data {
  name: string;
  age: number;
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
  { name: 'Lee', age: 20 }
];
const columns = [
  { name: 'name', editor: 'text' },
  { name: 'age', editor: 'text' }
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
    .should(rows => {
      Cypress.$.each(rows, (type: keyof ModifiedRowsLengthMap) => {
        expect(rows[type]).to.have.length(lengthMap[type]);
      });
    });
}

function assertModifiedRowsContainsObject(modifiedRowsMap: ModifiedRowsMap) {
  cy.gridInstance()
    .invoke('getModifiedRows')
    .should(rows => {
      Cypress.$.each(modifiedRowsMap, (type: keyof ModifiedRowsMap) => {
        const targetModifiedRows = rows[type];
        modifiedRowsMap[type]!.forEach((row, index) => {
          expect(targetModifiedRows[index]).to.contain(row);
        });
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
  it('should add updated row to updateRows property once, when modified by setValue API in multiple times', () => {
    cy.gridInstance().invoke('appendRow', { name: 'Park', age: 30 });
    cy.gridInstance().invoke('setValue', 2, 'age', 20);
    cy.gridInstance().invoke('setValue', 0, 'name', 'RYU');
    cy.gridInstance().invoke('setValue', 0, 'name', 'JIN');

    assertModifiedRowsLength({ createdRows: 1, updatedRows: 1, deletedRows: 0 });
    assertModifiedRowsContainsObject({
      createdRows: [{ name: 'Park', age: 20 }],
      updatedRows: [{ name: 'JIN', age: 10 }]
    });
  });

  it('should add updated row to updateRows property once, when modified by setRow API in multiple times', () => {
    cy.gridInstance().invoke('setRow', 0, { name: 'Park', age: 30 });
    cy.gridInstance().invoke('setRow', 0, { name: 'JIN', age: 10 });

    assertModifiedRowsLength({ createdRows: 0, updatedRows: 1, deletedRows: 0 });
    assertModifiedRowsContainsObject({ updatedRows: [{ name: 'JIN', age: 10 }] });
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
