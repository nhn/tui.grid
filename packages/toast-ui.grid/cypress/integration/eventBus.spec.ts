import { cls } from '@/helper/dom';
import GridEvent from '@/event/gridEvent';

const data = [
  { name: 'Kim', age: 10 },
  { name: 'Lee', age: 20 }
];
const columns = [
  { name: 'name', editor: 'text', resizable: true, sortable: true, minWidth: 250 },
  { name: 'age', filter: 'number', minWidth: 250 }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.createGrid({
    data,
    columns,
    bodyHeight: 150,
    width: 500,
    rowHeaders: ['rowNum', 'checkbox']
  });
});

it('click', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'click', callback);

  cy.getCell(1, 'name').click();

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'name',
    targetType: 'cell'
  });
});

it('mouseover', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mouseover', callback);

  cy.getCell(1, 'name').trigger('mouseover');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'name',
    targetType: 'cell'
  });
});

it('mousedown', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mousedown', callback);

  cy.getCell(1, 'name').trigger('mousedown');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'name',
    targetType: 'cell'
  });
});

it('mousedown stop', () => {
  cy.gridInstance().invoke('on', 'mousedown', (ev: GridEvent) => {
    ev.stop();
  });

  cy.getCell(1, 'age').trigger('mousedown');

  cy.getByCls('layer-focus').should('have.class', cls('layer-focus-deactive'));
});

it('mouseout', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mouseout', callback);

  cy.getCell(1, 'name').trigger('mouseout');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'name',
    targetType: 'cell'
  });
});

it('dblclick', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'dblclick', callback);

  cy.getByCls('container').dblclick();

  cy.wrap(callback).should('be.calledWithMatch', { targetType: 'cell' });
});

it('selection by api', () => {
  // keyboard, mouse event untestable
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'selection', callback);

  cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [1, 1] });

  cy.wrap(callback).should('be.calledWithMatch', { range: { column: [0, 1], row: [0, 1] } });
});

it('off', () => {
  const callback1 = cy.stub();
  const callback2 = cy.stub();

  cy.gridInstance().invoke('on', 'click', callback1);
  cy.gridInstance().invoke('on', 'click', callback2);
  cy.gridInstance().invoke('off', 'click', callback1);

  cy.getByCls('container').click();

  cy.wrap(callback2).should('not.be.calledTwice');

  cy.wrap(callback1).should('not.be.called');
  cy.wrap(callback2).should('be.calledOnce');

  cy.gridInstance().invoke('off', 'click');

  cy.getByCls('container').click();

  cy.wrap(callback2).should('not.be.calledTwice');
});

it('onGridMounted', () => {
  const callback = cy.stub();

  cy.createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
    onGridMounted: callback
  });

  cy.wrap(callback).should('be.calledOnce');
});

it('onGridUpdated', () => {
  const callback = cy.stub();
  const newData = [{ name: 'Lee', age: 20 }];

  cy.createGrid({
    data,
    columns,
    onGridUpdated: callback
  });
  cy.gridInstance().invoke('resetData', newData);

  cy.wrap(callback).should('be.calledOnce');
});

it('onGridBeforeDestroy', () => {
  const callback = cy.stub();

  cy.createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
    onGridBeforeDestroy: callback
  });
  cy.gridInstance().invoke('destroy');

  cy.wrap(callback).should('be.calledOnce');
});

it('columnResize', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'columnResize', callback);

  cy.getByCls('column-resize-handle')
    .first()
    .trigger('mousedown')
    .trigger('mousemove', { pageX: 400 })
    .trigger('mouseup');

  cy.wrap(callback).should('be.calledWithMatch', {
    resizedColumns: [{ columnName: 'name', width: 311 }]
  });
});

describe('scrollEnd', () => {
  beforeEach(() => {
    const newData = Array.from({ length: 20 }).map((_, index) => ({
      name: `name${index}`,
      age: index
    }));

    cy.gridInstance().invoke('resetData', newData);
  });

  it('should occur scrollEnd event at the bottomost', () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'scrollEnd', callback);

    // scroll at the bottommost
    cy.focusAndWait(19, 'name');

    cy.wrap(callback).should('be.calledOnce');
  });

  it('should not occur scrollEnd event after scrolling horizontally ', () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'scrollEnd', callback);

    // scroll at the bottommost
    cy.focusAndWait(19, 'name');
    // scroll horizontally
    cy.focusAndWait(19, 'age');

    cy.wrap(callback).should('be.calledOnce');
  });
});

describe('focus', () => {
  ['UI', 'API'].forEach(type => {
    it(`focus change by ${type}`, () => {
      const callback = cy.stub();
      cy.gridInstance().invoke('on', 'focusChange', callback);

      if (type === 'UI') {
        cy.getCell(0, 'name').click();
      } else {
        cy.gridInstance().invoke('focus', 0, 'name');
      }

      cy.wrap(callback).should('be.calledWithMatch', {
        rowKey: 0,
        columnName: 'name',
        prevRowKey: null,
        prevColumnName: null
      });

      if (type === 'UI') {
        cy.getCell(1, 'age').click();
      } else {
        cy.gridInstance().invoke('focus', 1, 'age');
      }

      cy.wrap(callback).should('be.calledWithMatch', {
        rowKey: 1,
        columnName: 'age',
        prevRowKey: 0,
        prevColumnName: 'name'
      });
    });

    it(`focus stop by ${type}`, () => {
      cy.gridInstance().invoke('on', 'focusChange', (ev: GridEvent) => {
        ev.stop();
      });

      if (type === 'UI') {
        cy.getCell(0, 'name').click();
      } else {
        cy.gridInstance().invoke('focus', 0, 'name');
      }

      cy.getByCls('layer-focus').should('not.exist');
    });
  });
});

describe('rowHeader: checkbox', () => {
  ['UI', 'API'].forEach(type => {
    it(`check / uncheck by ${type}`, () => {
      const checkCallback = cy.stub();
      const uncheckCallback = cy.stub();

      cy.getByCls('cell-row-header')
        .get('input')
        .eq(1)
        .as('checkbox');

      cy.gridInstance().invoke('on', 'check', checkCallback);
      cy.gridInstance().invoke('on', 'uncheck', uncheckCallback);

      if (type === 'UI') {
        cy.get('@checkbox').click();
      } else {
        cy.gridInstance().invoke('check', 0);
      }

      cy.wrap(checkCallback).should('be.calledWithMatch', { rowKey: 0 });

      if (type === 'UI') {
        cy.get('@checkbox').click();
      } else {
        cy.gridInstance().invoke('uncheck', 0);
      }

      cy.wrap(uncheckCallback).should('be.calledWithMatch', { rowKey: 0 });
    });

    it(`checkAll / uncheckAll by ${type}`, () => {
      const checkCallback = cy.stub();
      const uncheckCallback = cy.stub();

      cy.getByCls('cell-row-header')
        .get('input')
        .eq(0)
        .as('checkbox');

      cy.gridInstance().invoke('on', 'checkAll', checkCallback);
      cy.gridInstance().invoke('on', 'uncheckAll', uncheckCallback);

      if (type === 'UI') {
        cy.get('@checkbox').click();
      } else {
        cy.gridInstance().invoke('checkAll');
      }

      cy.wrap(checkCallback).should('be.calledOnce');

      if (type === 'UI') {
        cy.get('@checkbox').click();
      } else {
        cy.gridInstance().invoke('uncheckAll');
      }

      cy.wrap(uncheckCallback).should('be.calledOnce');
    });
  });
});

// @TODO: `sort` event will be deprecated. This event is replaced with `afterSort` event
describe('afterSort', () => {
  ['UI', 'API'].forEach(type => {
    it(`sort by ${type}`, () => {
      const sortCallback = cy.stub();
      const afterSortCallback = cy.stub();

      cy.gridInstance().invoke('on', 'sort', sortCallback);
      cy.gridInstance().invoke('on', 'afterSort', afterSortCallback);

      if (type === 'UI') {
        cy.getByCls('btn-sorting').click();
      } else {
        cy.gridInstance().invoke('sort', 'name', true);
      }

      cy.wrap(sortCallback).should('be.calledWithMatch', {
        sortState: { columns: [{ columnName: 'name', ascending: true }], useClient: true }
      });
      cy.wrap(afterSortCallback).should('be.calledWithMatch', {
        sortState: { columns: [{ columnName: 'name', ascending: true }], useClient: true }
      });
    });
  });
});

describe('beforeSort', () => {
  ['UI', 'API'].forEach(type => {
    it(`sort by ${type}`, () => {
      const callback = cy.stub();

      cy.gridInstance().invoke('on', 'beforeSort', callback);

      if (type === 'UI') {
        cy.getByCls('btn-sorting').click();
      } else {
        cy.gridInstance().invoke('sort', 'name', true);
      }

      cy.wrap(callback).should('be.calledWithMatch', {
        sortState: { columns: [{ columnName: 'sortKey', ascending: true }], useClient: true },
        nextColumnSortState: {
          columnName: 'name',
          ascending: true,
          multiple: false,
          unsorted: false
        },
        columnName: 'name'
      });
    });
  });
});

describe('editing', () => {
  ['API', 'UI'].forEach(type => {
    it(`editingStart by ${type}`, () => {
      const callback = cy.stub();
      cy.gridInstance().invoke('on', 'editingStart', callback);

      if (type === 'UI') {
        cy.gridInstance().invoke('focus', 0, 'name');
        cy.getByCls('clipboard').trigger('keydown', { keyCode: 13, which: 13, force: true });
      } else {
        cy.gridInstance().invoke('startEditing', 0, 'name');
      }

      cy.wrap(callback).should('be.calledWithMatch', {
        rowKey: 0,
        columnName: 'name',
        value: 'Kim'
      });
    });

    it(`editingFinish by ${type}`, () => {
      const callback = cy.stub();

      cy.gridInstance().invoke('on', 'editingFinish', callback);

      cy.gridInstance().invoke('startEditing', 0, 'name');

      if (type === 'UI') {
        cy.gridInstance().invoke('focus', 1, 'name');
      } else {
        cy.gridInstance().invoke('finishEditing');
      }

      cy.wrap(callback).should('be.calledWithMatch', {
        rowKey: 0,
        columnName: 'name',
        value: 'Kim'
      });
    });
  });
});

describe('filter', () => {
  function inputFilterValue(value: string) {
    cy.getByCls('filter-container', 'filter-input').type(value);
  }

  function clickFilterBtn() {
    cy.getByCls('btn-filter').click();
  }

  function applyFilterByUI(value: string) {
    clickFilterBtn();
    inputFilterValue(value);
  }

  ['API', 'UI'].forEach(type => {
    it(`filter by ${type}`, () => {
      const callback = cy.stub();

      cy.gridInstance().invoke('on', 'filter', callback);

      if (type === 'UI') {
        applyFilterByUI('20');
      } else {
        cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: 20 }]);
      }

      cy.wrap(callback).should(() => {
        setTimeout(() => {
          expect(callback.args[0][0]).to.contain.subset({
            filterState: [{ columnName: 'age', state: [{ code: 'eq', value: 20 }], type: 'number' }]
          });
        });
      });
    });
  });
});
