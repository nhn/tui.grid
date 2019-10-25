before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
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

['API', 'UI'].forEach(method => {
  it(`selection and delete (by ${method})`, () => {
    cy.createGrid(defaultOptions);
    if (method === 'API') {
      setSelectionByAPI([1, 1], [2, 2]);
    } else {
      setSelectionByUI([1, 1], [2, 2]);
    }

    pressDeleteKey();

    cy.getCellData().should('eql', [
      ['c1', 'c2', 'c3'],
      ['c1', '', ''],
      ['c1', '', ''],
      ['c1', 'c2', 'c3']
    ]);
  });
});
