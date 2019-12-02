before(() => {
  cy.visit('/dist');
});

const columns = [
  { name: 'c1', editor: { type: 'text' } },
  { name: 'c2', editor: { type: 'text' } },
  { name: 'c3', editor: { type: 'text' } }
];

const data = [
  { c1: 'c1', c2: 'c2', c3: 'c3' },
  { c1: 'c1', c2: 'c2', c3: 'c3' },
  { c1: 'c1', c2: 'c2', c3: 'c3' },
  { c1: 'c1', c2: 'c2', c3: 'c3' }
];

const defaultOptions = {
  data,
  columns,
  bodyHeight: 300,
  columnOptions: {
    minWidth: 150
  }
};

type Address = [number, number];

function setSelectionByAPI(start: Address, end: Address) {
  cy.gridInstance().invoke('setSelectionRange', { start, end });
}

function setSelectionByUI(start: Address, end: Address) {
  cy.getCellByIdx(start[0], start[1]).trigger('mousedown');
  cy.getCellByIdx(end[0], end[1])
    .invoke('offset')
    .then(({ left, top }) => {
      cy.get('body')
        .trigger('mousemove', { pageX: left + 10, pageY: top + 10 })
        .trigger('mouseup');
    });
}

function pressDeleteKey() {
  cy.getByCls('clipboard').type('{del}', { force: true });
}

// @TODO move to keymap test
['API', 'UI'].forEach(method => {
  it(`selection and delete (by ${method})`, () => {
    cy.createGrid(defaultOptions);
    if (method === 'API') {
      setSelectionByAPI([1, 1], [2, 2]);
    } else {
      setSelectionByUI([1, 1], [2, 2]);
    }

    pressDeleteKey();

    cy.getRsideBody().should('have.cellData', [
      ['c1', 'c2', 'c3'],
      ['c1', '', ''],
      ['c1', '', ''],
      ['c1', 'c2', 'c3']
    ]);
  });
});

// @TODO if cypress issue is resolved, should change to validate clipboard data.
// https://github.com/cypress-io/cypress/issues/2386
// describe('copy to clipboard', () => {
//   it('basic value', () => {});
//   it('formatted value', () => {});
//   it('custom value', () => {});
// });
// it('paste', () => {});

export {};
