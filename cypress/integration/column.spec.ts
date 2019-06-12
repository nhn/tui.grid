export {};

const data = [
  { id: 1, name: 'Kim', score: 90, grade: 'A' },
  { id: 2, name: 'Lee', score: 80, grade: 'B' }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

function assertRowText(rowIdx: number, cellTexts: string[]) {
  cellTexts.forEach((text, columnIdx) => {
    cy.getCellByIdx(rowIdx, columnIdx).should('to.have.text', text);
  });
}

describe.only('setColumns()', () => {
  it('resets the column data', () => {
    const columns = [{ name: 'id' }, { name: 'name' }];
    cy.createGrid({ data, columns });

    cy.gridInstance().invoke('setColumns', [{ name: 'id' }, { name: 'score' }, { name: 'grade' }]);

    assertRowText(0, ['1', '90', 'A']);
    assertRowText(1, ['2', '80', 'B']);
  });
});

describe('getIndexOfColumn()', () => {
  it('returns the index of column having given columnName', () => {
    const columns = [{ name: 'id' }, { name: 'name' }, { name: 'age' }];
    cy.createGrid({ data, columns });

    cy.gridInstance()
      .invoke('getIndexOfColumn', 'name')
      .should('eq', 1);

    cy.gridInstance()
      .invoke('getIndexOfColumn', 'age')
      .should('eq', 2);
  });
});
