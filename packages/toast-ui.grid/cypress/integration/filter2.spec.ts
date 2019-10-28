before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

function invokeFilter(states: any) {
  cy.gridInstance().invoke('filter', 'score', states);
}

function clickFilterBtn() {
  cy.getByCls('btn-filter').click();
}

function selectFilterCode(option: any) {
  cy.getByCls('filter-container')
    .find('select')
    .select(option);
}

function clickCloseBtn() {
  cy.getByCls('filter-container', 'btn-close').click();
}

function getFilterLayer() {
  return cy.getByCls('filter-container');
}

function getRsideBody() {
  return cy.getByCls('rside-area', 'body-area');
}

function inputFilterValue(value: string) {
  cy.getByCls('filter-container', 'filter-input').type(value);
}

function applyFilterByUI(option: any, value: string) {
  clickFilterBtn();
  selectFilterCode(option);
  inputFilterValue(value);
}

describe('UI: Layer', () => {
  const columns = [{ name: 'id' }, { name: 'score', filter: 'number' }];
  beforeEach(() => {
    cy.createGrid({ data: [], columns });
  });

  it('click filter button -> show layer', () => {
    clickFilterBtn();
    getFilterLayer().should('be.visible');
  });

  it('click close button -> hide layer', () => {
    clickFilterBtn();
    clickCloseBtn();
    getFilterLayer().should('not.be.visible');
  });

  it('click inside of the layer -> hide layer', () => {
    clickFilterBtn();
    getFilterLayer().click();
    getFilterLayer().should('be.visible');
  });

  it('click outside of the layer -> hide layer', () => {
    clickFilterBtn();
    cy.getByCls('container').click();
    getFilterLayer().should('not.be.visible');
  });
});

describe('apply filter (type: number)', () => {
  const columns = [{ name: 'id' }, { name: 'score', filter: 'number' }];
  const data = [
    { id: 'player1', score: 80 },
    { id: 'player2', score: 70 },
    { id: 'player3', score: 60 },
    { id: 'player4', score: 65 },
    { id: 'player5', score: 50 },
    { id: 'player6', score: 90 },
    { id: 'player7', score: 90 }
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  ['API', 'UI'].forEach(method => {
    it(`code:gte by ${method}`, () => {
      if (method === 'API') {
        invokeFilter([{ code: 'gte', value: 70 }]);
      } else {
        applyFilterByUI('>=', '70');
      }

      getRsideBody().should('have.cellData', [
        ['player1', '80'],
        ['player2', '70'],
        ['player6', '90'],
        ['player7', '90']
      ]);
    });
  });

  ['API', 'UI'].forEach(method => {
    it(`code:lte by ${method}`, () => {
      if (method === 'API') {
        invokeFilter([{ code: 'lte', value: 70 }]);
      } else {
        applyFilterByUI('<=', '70');
      }

      getRsideBody().should('have.cellData', [
        ['player2', '70'],
        ['player3', '60'],
        ['player4', '65'],
        ['player5', '50']
      ]);
    });
  });

  ['API', 'UI'].forEach(method => {
    it(`code:eq by ${method}`, () => {
      if (method === 'API') {
        invokeFilter([{ code: 'eq', value: 90 }]);
      } else {
        applyFilterByUI('=', '90');
      }

      getRsideBody().should('have.cellData', [['player6', '90'], ['player7', '90']]);
    });
  });

  ['API', 'UI'].forEach(method => {
    it(`code:ne by ${method}`, () => {
      if (method === 'API') {
        invokeFilter([{ code: 'ne', value: 90 }]);
      } else {
        applyFilterByUI('!=', '90');
      }

      getRsideBody().should('have.cellData', [
        ['player1', '80'],
        ['player2', '70'],
        ['player3', '60'],
        ['player4', '65'],
        ['player5', '50']
      ]);
    });
  });
});
