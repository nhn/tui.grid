import { FormatterProps } from '@t/store/column';
import { cls } from '@/helper/dom';
import { OptRow } from '@t/options';
import { clickFilterBtn, inputFilterValue, invokeFilter } from '../helper/util';

const GRID_WIDTH = 500;

before(() => {
  cy.visit('/dist');
});

function selectFilterCode(option: any) {
  cy.getByCls('filter-container').find('select').select(option);
}

function clickCloseBtn() {
  cy.getByCls('filter-container', 'btn-close').click();
}

function getFilterLayer() {
  return cy.getByCls('filter-container');
}

function getFilterListItem() {
  return cy.get(`.${cls('filter-list-item')} label`);
}

function getHeaderCheckbox() {
  return cy.get('th input[type=checkbox]');
}

function getCellCheckbox() {
  return cy.get('td input[type=checkbox]');
}

function applyFilterByUI(option: any, value: string) {
  clickFilterBtn();
  selectFilterCode(option);
  inputFilterValue(value);
}

function toggleSelectFilter(index: number) {
  getFilterListItem().eq(index).click();
}

function applyFilterBySelectUI(index: number) {
  clickFilterBtn();
  toggleSelectFilter(index);
}

function assertFilterBtnClass(active = false) {
  if (active) {
    cy.getByCls('btn-filter').should('have.class', cls('btn-filter-active'));
  } else {
    cy.getByCls('btn-filter').should('not.have.class', cls('btn-filter-active'));
  }
}

describe('UI: Layer', () => {
  const columns = [{ name: 'id' }, { name: 'score', filter: 'number' }];
  beforeEach(() => {
    cy.createGrid({ data: [], columns, width: GRID_WIDTH });
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

  it('should always show inside of the grid', () => {
    clickFilterBtn();

    cy.getByCls('filter-container').should(($el) => {
      const { offsetLeft, clientWidth } = $el[0];

      expect(clientWidth + offsetLeft).to.be.lessThan(GRID_WIDTH);
    });
  });
});

describe('UI: Button', () => {
  const columns = [
    { name: 'id', filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
    { name: 'age' },
  ];
  const data = [
    { id: 'player1', age: 10 },
    { id: 'player2', age: 20 },
    { id: 'player3', age: 30 },
    { id: 'player4', age: 35 },
    { id: 'player5', age: 40 },
    { id: 'player6', age: 20 },
    { id: 'player7', age: 30 },
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it('Inactive filter button does not have active className', () => {
    assertFilterBtnClass();
  });

  it('active filter button has active className', () => {
    cy.gridInstance().invoke('filter', 'id', [{ code: 'eq', value: 'player1' }]);
    assertFilterBtnClass(true);
  });

  it('If filter has showClearBtn option, clear button exists', () => {
    clickFilterBtn();
    cy.getByCls('filter-btn-clear').should('exist');
  });

  it('If filter has showApplyBtn option, apply button exists', () => {
    clickFilterBtn();
    cy.getByCls('filter-btn-apply').should('exist');
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
    { id: 'player7', score: 90 },
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  ['API', 'UI'].forEach((method) => {
    it(`code:gt by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('score', [{ code: 'gt', value: 70 }]);
      } else {
        applyFilterByUI('>', '70');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player1', '80'],
        ['player6', '90'],
        ['player7', '90'],
      ]);
    });

    it(`code:gte by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('score', [{ code: 'gte', value: 70 }]);
      } else {
        applyFilterByUI('>=', '70');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player1', '80'],
        ['player2', '70'],
        ['player6', '90'],
        ['player7', '90'],
      ]);
    });

    it(`code:lt by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('score', [{ code: 'lt', value: 70 }]);
      } else {
        applyFilterByUI('<', '70');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player3', '60'],
        ['player4', '65'],
        ['player5', '50'],
      ]);
    });

    it(`code:lte by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('score', [{ code: 'lte', value: 70 }]);
      } else {
        applyFilterByUI('<=', '70');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player2', '70'],
        ['player3', '60'],
        ['player4', '65'],
        ['player5', '50'],
      ]);
    });

    it(`code:eq by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('score', [{ code: 'eq', value: 90 }]);
      } else {
        applyFilterByUI('=', '90');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player6', '90'],
        ['player7', '90'],
      ]);
    });

    it(`code:ne by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('score', [{ code: 'ne', value: 90 }]);
      } else {
        applyFilterByUI('!=', '90');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player1', '80'],
        ['player2', '70'],
        ['player3', '60'],
        ['player4', '65'],
        ['player5', '50'],
      ]);
    });
  });
});

describe('apply filter (type: text)', () => {
  const columns = [{ name: 'id' }, { name: 'name', filter: 'text' }];
  const data = [
    { id: 'player1', name: 'Choi' },
    { id: 'player2', name: 'Kim' },
    { id: 'player3', name: 'Ryu' },
    { id: 'player4', name: 'Han' },
    { id: 'player5', name: 'Park' },
    { id: 'player6', name: 'Lee' },
    { id: 'player7', name: 'Yoo' },
    { id: 'player8', name: 'Lim' },
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  ['API', 'UI'].forEach((method) => {
    it(`code:eq by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('name', [{ code: 'eq', value: 'Lee' }]);
      } else {
        applyFilterByUI('eq', 'Lee');
      }

      cy.getRsideBody().should('have.cellData', [['player6', 'Lee']]);
    });

    it(`code:ne by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('name', [{ code: 'ne', value: 'Lee' }]);
      } else {
        applyFilterByUI('ne', 'Lee');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player1', 'Choi'],
        ['player2', 'Kim'],
        ['player3', 'Ryu'],
        ['player4', 'Han'],
        ['player5', 'Park'],
        ['player7', 'Yoo'],
        ['player8', 'Lim'],
      ]);
    });

    it(`code:contain by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('name', [{ code: 'contain', value: 'a' }]);
      } else {
        applyFilterByUI('contain', 'a');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player4', 'Han'],
        ['player5', 'Park'],
      ]);
    });

    it(`code:start by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('name', [{ code: 'start', value: 'L' }]);
      } else {
        applyFilterByUI('start', 'L');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player6', 'Lee'],
        ['player8', 'Lim'],
      ]);
    });

    it(`code:end by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('name', [{ code: 'end', value: 'm' }]);
      } else {
        applyFilterByUI('end', 'm');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player2', 'Kim'],
        ['player8', 'Lim'],
      ]);
    });
  });

  it(`code:contain type with multiple key`, () => {
    clickFilterBtn();
    selectFilterCode('contain');
    cy.getByCls('filter-container', 'filter-input').type('{shift}C');

    cy.getRsideBody().should('have.cellData', [['player1', 'Choi']]);
  });
});

describe('apply filter (type: select)', () => {
  const columns = [{ name: 'id', filter: 'select' }, { name: 'name' }];
  const data = [
    { id: 'player1', name: 'Choi' },
    { id: 'player2', name: 'Kim' },
    { id: 'player3', name: 'Ryu' },
    { id: 'player4', name: 'Han' },
    { id: 'player5', name: 'Park' },
    { id: 'player6', name: 'Lee' },
    { id: 'player7', name: 'Yoo' },
    { id: 'player8', name: 'Lim' },
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  ['API', 'UI'].forEach((method) => {
    it(`code:eq by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('id', [
          { code: 'eq', value: 'player2' },
          { code: 'eq', value: 'player3' },
          { code: 'eq', value: 'player4' },
          { code: 'eq', value: 'player5' },
          { code: 'eq', value: 'player6' },
          { code: 'eq', value: 'player7' },
          { code: 'eq', value: 'player8' },
        ]);
      } else {
        applyFilterBySelectUI(1);
      }
      cy.getRsideBody().should('have.cellData', [
        ['player2', 'Kim'],
        ['player3', 'Ryu'],
        ['player4', 'Han'],
        ['player5', 'Park'],
        ['player6', 'Lee'],
        ['player7', 'Yoo'],
        ['player8', 'Lim'],
      ]);
    });
  });

  it('When searching, the items contained text are listed.', () => {
    clickFilterBtn();
    inputFilterValue('player3');

    getFilterListItem().its('length').should('eq', 2);
  });

  it('When clicking selectAll checkbox, apply all list item checkbox and filtering.', () => {
    applyFilterBySelectUI(0);

    cy.getRsideBody().should('have.cellData', []);

    toggleSelectFilter(0);

    cy.getRsideBody().should('have.cellData', [
      ['player1', 'Choi'],
      ['player2', 'Kim'],
      ['player3', 'Ryu'],
      ['player4', 'Han'],
      ['player5', 'Park'],
      ['player6', 'Lee'],
      ['player7', 'Yoo'],
      ['player8', 'Lim'],
    ]);
  });

  it('should set filter to intended filter when filter change after all rows for previous filter are disappear.', () => {
    cy.gridInstance().invoke('resetData', data.slice(0, 3));

    invokeFilter('id', [{ code: 'eq', value: 'player1' }]);

    cy.gridInstance().invoke('setRow', 0, { ...data[0], id: data[1].id });

    applyFilterBySelectUI(1);

    cy.getRsideBody().should('have.cellData', [
      ['player2', 'Choi'],
      ['player2', 'Kim'],
    ]);
  });
});

describe('apply filter (type: select) with nil(null, undefined) or empty string value', () => {
  const columns = [{ name: 'id', filter: 'select' }, { name: 'name' }];
  const data = [
    { id: 'player1', name: 'Choi' },
    { id: 'player2', name: 'Kim' },
    { id: 'player3', name: 'Ryu' },
    { id: null, name: 'Pyo' },
    { id: '', name: 'Oh' },
    // eslint-disable-next-line no-undefined
    { id: undefined, name: 'Kwag' },
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it(`should display 'Empty value' in select filter`, () => {
    clickFilterBtn();

    const selectFilterList = getFilterListItem();
    const expected = ['Select All', 'player1', 'player2', 'player3', 'Empty Value'];

    selectFilterList.each(($el, index) => {
      cy.wrap($el).should('have.text', expected[index]);
    });
  });

  ['API', 'UI'].forEach((method) => {
    it(`should filter all empty values(null, undefined, empty string) by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('id', [
          { code: 'eq', value: 'player1' },
          { code: 'eq', value: 'player2' },
          { code: 'eq', value: 'player3' },
        ]);
      } else {
        applyFilterBySelectUI(4);
      }
      cy.getRsideBody().should('have.cellData', [
        ['player1', 'Choi'],
        ['player2', 'Kim'],
        ['player3', 'Ryu'],
      ]);
    });
  });

  it(`should toggle all empty values(null, undefined, empty string)`, () => {
    applyFilterBySelectUI(4);

    toggleSelectFilter(4);

    cy.getRsideBody().should('have.cellData', [
      ['player1', 'Choi'],
      ['player2', 'Kim'],
      ['player3', 'Ryu'],
      ['', 'Pyo'],
      ['', 'Oh'],
      ['', 'Kwag'],
    ]);
  });
});

describe('apply filter (type: datepicker)', () => {
  const columns = [{ name: 'id' }, { name: 'date', filter: 'date' }];
  const data = [
    { id: 'player1', date: '2019.11.25' },
    { id: 'player2', date: '2019.09.18' },
    { id: 'player3', date: '2020.01.03' },
    { id: 'player4', date: '2017.07.27' },
    { id: 'player5', date: '2016.06.27' },
    { id: 'player6', date: '2018.11.02' },
    { id: 'player7', date: '2019.12.25' },
    { id: 'player8', date: '2020.03.03' },
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  ['API', 'UI'].forEach((method) => {
    it(`code:eq by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('date', [{ code: 'eq', value: '2019.09.18' }]);
      } else {
        applyFilterByUI('eq', '2019.09.18');
      }

      cy.getRsideBody().should('have.cellData', [['player2', '2019.09.18']]);
    });

    it(`code:ne by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('date', [{ code: 'ne', value: '2019.11.25' }]);
      } else {
        applyFilterByUI('ne', '2019.11.25');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player2', '2019.09.18'],
        ['player3', '2020.01.03'],
        ['player4', '2017.07.27'],
        ['player5', '2016.06.27'],
        ['player6', '2018.11.02'],
        ['player7', '2019.12.25'],
        ['player8', '2020.03.03'],
      ]);
    });

    it(`code:after by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('date', [{ code: 'after', value: '2019.12.25' }]);
      } else {
        applyFilterByUI('after', '2019.12.25');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player3', '2020.01.03'],
        ['player8', '2020.03.03'],
      ]);
    });

    it(`code:afterEq by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('date', [{ code: 'afterEq', value: '2019.12.25' }]);
      } else {
        applyFilterByUI('afterEq', '2019.12.25');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player3', '2020.01.03'],
        ['player7', '2019.12.25'],
        ['player8', '2020.03.03'],
      ]);
    });

    it(`code:before by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('date', [{ code: 'before', value: '2017.07.27' }]);
      } else {
        applyFilterByUI('before', '2017.07.27');
      }

      cy.getRsideBody().should('have.cellData', [['player5', '2016.06.27']]);
    });

    it(`code:beforeEq by ${method}`, () => {
      if (method === 'API') {
        invokeFilter('date', [{ code: 'beforeEq', value: '2017.07.27' }]);
      } else {
        applyFilterByUI('beforeEq', '2017.07.27');
      }

      cy.getRsideBody().should('have.cellData', [
        ['player4', '2017.07.27'],
        ['player5', '2016.06.27'],
      ]);
    });
  });
});

describe('filter API', () => {
  const columns = [{ name: 'id' }, { name: 'age', filter: 'number' }];
  const data = [
    { id: 'player1', age: 10 },
    { id: 'player2', age: 20 },
    { id: 'player3', age: 30 },
    { id: 'player4', age: 35 },
    { id: 'player5', age: 40 },
    { id: 'player6', age: 20 },
    { id: 'player7', age: 30 },
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  describe('unfilter API', () => {
    it('unfilter the specific column properly', () => {
      cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: 30 }]);

      cy.getRsideBody().should('have.cellData', [
        ['player3', '30'],
        ['player7', '30'],
      ]);

      cy.gridInstance().invoke('unfilter', 'age');

      cy.getRsideBody().should('have.cellData', [
        ['player1', '10'],
        ['player2', '20'],
        ['player3', '30'],
        ['player4', '35'],
        ['player5', '40'],
        ['player6', '20'],
        ['player7', '30'],
      ]);
    });

    it('unfilter the all columns properly', () => {
      const columnsWithMultiFilter = [
        { name: 'id', filter: 'text' },
        { name: 'age', filter: 'number' },
      ];
      cy.createGrid({ data, columns: columnsWithMultiFilter });

      cy.gridInstance().invoke('filter', 'id', [{ code: 'eq', value: 'player4' }]);
      cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: '40' }]);

      cy.gridInstance().invoke('unfilter');

      cy.getRsideBody().should('have.cellData', [
        ['player1', '10'],
        ['player2', '20'],
        ['player3', '30'],
        ['player4', '35'],
        ['player5', '40'],
        ['player6', '20'],
        ['player7', '30'],
      ]);
    });
  });

  it('getFilterState()', () => {
    cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: 30 }]);
    cy.gridInstance()
      .invoke('getFilterState')
      .should('have.subset', [
        {
          columnName: 'age',
          state: [{ code: 'eq', value: 30 }],
          type: 'number',
        },
      ]);
  });

  it('setFilter()', () => {
    cy.getHeaderCell('id')
      .children(`.${cls('btn-filter')}`)
      .should('not.exist');

    cy.gridInstance().invoke('setFilter', 'id', { type: 'text' });

    cy.getHeaderCell('id')
      .children(`.${cls('btn-filter')}`)
      .should('exist');
  });
});

describe('filtering data with button option', () => {
  const columns = [
    { name: 'id', filter: { type: 'text', showApplyBtn: true, showClearBtn: true } },
    { name: 'age' },
  ];
  const data = [
    { id: 'player1', age: 10 },
    { id: 'player2', age: 20 },
    { id: 'player3', age: 30 },
    { id: 'player4', age: 35 },
    { id: 'player5', age: 40 },
    { id: 'player6', age: 20 },
    { id: 'player7', age: 30 },
  ];

  beforeEach(() => {
    cy.createGrid({ data, columns });
  });

  it('Clear Button -> initialize the filtering when clicking the clear button', () => {
    cy.gridInstance().invoke('filter', 'id', [{ code: 'eq', value: 'player1' }]);

    cy.getRsideBody().should('have.cellData', [['player1', '10']]);

    clickFilterBtn();
    cy.getByCls('filter-btn-clear').click();

    cy.getRsideBody().should('have.cellData', [
      ['player1', '10'],
      ['player2', '20'],
      ['player3', '30'],
      ['player4', '35'],
      ['player5', '40'],
      ['player6', '20'],
      ['player7', '30'],
    ]);
  });

  it('Apply Button -> only apply the filtering when clicking the apply button', () => {
    applyFilterByUI('eq', 'player1');

    cy.getRsideBody().should('have.cellData', [
      ['player1', '10'],
      ['player2', '20'],
      ['player3', '30'],
      ['player4', '35'],
      ['player5', '40'],
      ['player6', '20'],
      ['player7', '30'],
    ]);

    cy.getByCls('filter-btn-apply').click();

    cy.getRsideBody().should('have.cellData', [['player1', '10']]);
  });
});

it('filtering data with operator option', () => {
  const columns = [{ name: 'id' }, { name: 'age', filter: { type: 'text', operator: 'OR' } }];
  const data = [
    { id: 'player1', age: 10 },
    { id: 'player2', age: 20 },
    { id: 'player3', age: 30 },
    { id: 'player4', age: 35 },
    { id: 'player5', age: 40 },
    { id: 'player6', age: 20 },
    { id: 'player7', age: 30 },
  ];

  cy.createGrid({ data, columns });
  clickFilterBtn();
  cy.getByCls('filter-input').type('10');
  cy.getByCls('filter-input').eq(1).type('30');

  cy.getRsideBody().should('have.cellData', [
    ['player1', '10'],
    ['player3', '30'],
    ['player7', '30'],
  ]);
});

it('multiple filters are applied correctly.', () => {
  const columns = [
    { name: 'name', filter: 'text' },
    { name: 'age', filter: 'number' },
  ];
  const data = [
    { name: 'player1', age: 10 },
    { name: 'player2', age: 20 },
    { name: 'player2', age: 30 },
    { name: 'player3', age: 35 },
    { name: 'player4', age: 40 },
    { name: 'player5', age: 20 },
    { name: 'player4', age: 30 },
    { name: 'player4', age: 40 },
  ];
  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'player4' }]);

  cy.getRsideBody().should('have.cellData', [
    ['player4', '40'],
    ['player4', '30'],
    ['player4', '40'],
  ]);

  cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: '40' }]);

  cy.getRsideBody().should('have.cellData', [
    ['player4', '40'],
    ['player4', '40'],
  ]);
});

describe('check other option when filtering', () => {
  beforeEach(() => {
    const columns = [
      { name: 'name', filter: 'text' },
      { name: 'age', filter: 'number' },
    ];
    const data = [
      { id: 'player1', age: 10 },
      { id: 'player2', age: 20 },
      { id: 'player3', age: 30 },
      { id: 'player4', age: 35 },
      { id: 'player5', age: 40 },
      { id: 'player6', age: 20 },
      { id: 'player7', age: 30 },
    ];
    cy.createGrid({ data, columns, rowHeaders: ['rowNum', 'checkbox'] });
  });

  it('should not work filter for hidden column.', () => {
    cy.gridInstance().invoke('hideColumn', 'name');
    cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'player1' }]);

    cy.getRsideBody().should('have.cellData', [
      ['10'],
      ['20'],
      ['30'],
      ['35'],
      ['40'],
      ['20'],
      ['30'],
    ]);
  });

  it('should maintain the row number after filtering', () => {
    cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: 20 }]);

    cy.getRowHeaderCells('_number').should(($el) => {
      expect($el).to.have.length(2);
      expect($el.eq(0)).to.contain('2');
      expect($el.eq(1)).to.contain('6');
    });
  });

  it('should check only filtered rows when clicking the checkAll button.', () => {
    cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: 20 }]);
    getHeaderCheckbox().click();

    getHeaderCheckbox().should('be.checked');

    cy.gridInstance().invoke('unfilter', 'age');

    getCellCheckbox().filter('input[type=checkbox]:checked').should('have.length', 2);
    getHeaderCheckbox().should('not.be.checked');
  });
});

describe('apply filter with formatted value', () => {
  context('apply filter (type: select)', () => {
    beforeEach(() => {
      const columns = [
        {
          name: 'id',
          filter: 'select',
          formatter: ({ value }: FormatterProps) => `formatted_${value}`,
        },
        { name: 'name' },
      ];
      const data = [
        { id: 'player1', name: 'Choi' },
        { id: 'player2', name: 'Kim' },
        { id: 'player3', name: 'Ryu' },
        { id: 'player4', name: 'Han' },
        { id: 'player5', name: 'Park' },
        { id: 'player6', name: 'Lee' },
        { id: 'player7', name: 'Yoo' },
        { id: 'player8', name: 'Lim' },
      ];
      cy.createGrid({ data, columns });
    });

    it(`should display formatted value in select filter list`, () => {
      clickFilterBtn();

      getFilterListItem()
        .filter((index) => index > 0)
        .each(($el) => {
          cy.wrap($el).should('contain.text', 'formatted');
        });
    });

    it('When searching, the items contained text are listed.', () => {
      clickFilterBtn();
      inputFilterValue('formatted');

      getFilterListItem().its('length').should('eq', 9);
    });

    it('When clicking selectAll checkbox, apply all list item checkbox and filtering.', () => {
      applyFilterBySelectUI(0);

      cy.getRsideBody().should('have.cellData', []);

      toggleSelectFilter(0);

      cy.getRsideBody().should('have.cellData', [
        ['formatted_player1', 'Choi'],
        ['formatted_player2', 'Kim'],
        ['formatted_player3', 'Ryu'],
        ['formatted_player4', 'Han'],
        ['formatted_player5', 'Park'],
        ['formatted_player6', 'Lee'],
        ['formatted_player7', 'Yoo'],
        ['formatted_player8', 'Lim'],
      ]);
    });

    ['API', 'UI'].forEach((method) => {
      it(`code:eq by ${method}`, () => {
        if (method === 'API') {
          invokeFilter('id', [
            { code: 'eq', value: 'formatted_player2' },
            { code: 'eq', value: 'formatted_player3' },
            { code: 'eq', value: 'formatted_player4' },
            { code: 'eq', value: 'formatted_player5' },
            { code: 'eq', value: 'formatted_player6' },
            { code: 'eq', value: 'formatted_player7' },
            { code: 'eq', value: 'formatted_player8' },
          ]);
        } else {
          applyFilterBySelectUI(1);
        }

        cy.getRsideBody().should('have.cellData', [
          ['formatted_player2', 'Kim'],
          ['formatted_player3', 'Ryu'],
          ['formatted_player4', 'Han'],
          ['formatted_player5', 'Park'],
          ['formatted_player6', 'Lee'],
          ['formatted_player7', 'Yoo'],
          ['formatted_player8', 'Lim'],
        ]);
      });
    });
  });

  context('apply filter (type: text)', () => {
    beforeEach(() => {
      const columns = [
        {
          name: 'id',
          filter: 'text',
          formatter: ({ value }: FormatterProps) => `formatted_${value}`,
        },
        { name: 'name' },
      ];
      const data = [
        { id: 'player1', name: 'Choi' },
        { id: 'player2', name: 'Kim' },
        { id: 'player3', name: 'Ryu' },
        { id: 'player4', name: 'Han' },
        { id: 'player5', name: 'Park' },
        { id: 'player6', name: 'Lee' },
        { id: 'player7', name: 'Yoo' },
        { id: 'player8', name: 'Lim' },
      ];
      cy.createGrid({ data, columns });
    });

    ['API', 'UI'].forEach((method) => {
      it(`code:eq by ${method}`, () => {
        if (method === 'API') {
          invokeFilter('id', [{ code: 'eq', value: 'formatted_player1' }]);
        } else {
          applyFilterByUI('eq', 'formatted_player1');
        }

        cy.getRsideBody().should('have.cellData', [['formatted_player1', 'Choi']]);
      });
    });
  });

  context('apply filter (type: number)', () => {
    beforeEach(() => {
      const columns = [
        {
          name: 'id',
        },
        {
          name: 'age',
          filter: 'number',
          formatter: ({ value }: FormatterProps) => Number(value) - 1,
        },
      ];
      const data = [
        { id: 'player1', age: 20 },
        { id: 'player2', age: 30 },
        { id: 'player3', age: 10 },
        { id: 'player4', age: 30 },
        { id: 'player5', age: 50 },
        { id: 'player6', age: 40 },
        { id: 'player7', age: 30 },
        { id: 'player8', age: 20 },
      ];
      cy.createGrid({ data, columns });
    });

    ['API', 'UI'].forEach((method) => {
      it(`code:eq by ${method}`, () => {
        if (method === 'API') {
          invokeFilter('age', [{ code: 'eq', value: 19 }]);
        } else {
          applyFilterByUI('eq', '19');
        }

        cy.getRsideBody().should('have.cellData', [
          ['player1', '19'],
          ['player8', '19'],
        ]);
      });
    });
  });
});

describe('resetData API with filterState', () => {
  let data: OptRow[] = [];
  beforeEach(() => {
    data = [
      { id: 'player1', age: 10 },
      { id: 'player2', age: 20 },
      { id: 'player3', age: 30 },
      { id: 'player4', age: 35 },
      { id: 'player5', age: 40 },
      { id: 'player6', age: 20 },
      { id: 'player7', age: 30 },
    ];
    const columns = [{ name: 'id' }, { name: 'age', filter: { type: 'text', operator: 'OR' } }];
    cy.createGrid({ data, columns });
  });

  it('should apply the filterState after calling resetData with filterState option', () => {
    const filterState = { columnName: 'age', columnFilterState: [{ code: 'eq', value: 10 }] };

    cy.gridInstance().invoke('resetData', data, { filterState });

    assertFilterBtnClass(true);
  });

  it('should not apply the filterState to the column has no filter option after calling resetData with filterState option', () => {
    const filterState = { columnName: 'id', columnFilterState: [{ code: 'eq', value: 'player1' }] };

    cy.gridInstance().invoke('resetData', data, { filterState });

    cy.gridInstance().invoke('getFilterState').should('eq', null);
  });

  it('should remove the filterState', () => {
    invokeFilter('age', [{ code: 'eq', value: 10 }]);
    const filterState = { columnName: 'age', columnFilterState: null };

    cy.gridInstance().invoke('resetData', data, { filterState });

    assertFilterBtnClass(false);
  });
});
