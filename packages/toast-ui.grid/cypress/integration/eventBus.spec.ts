import { cls } from '@/helper/dom';
import GridEvent from '@/event/gridEvent';
import { GridEventProps } from '@t/event';
import { clipboardType, clickFilterBtn, inputFilterValue } from '../helper/util';

const data = [
  { name: 'Kim', age: 10 },
  { name: 'Lee', age: 20 },
];
const columns = [
  { name: 'name', editor: 'text', resizable: true, sortable: true, minWidth: 250 },
  { name: 'age', filter: 'number', minWidth: 250 },
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.createGrid({
    data,
    columns,
    draggable: true,
    bodyHeight: 150,
    width: 500,
    rowHeaders: ['rowNum', 'checkbox'],
  });
});

it('click', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'click', callback);

  cy.getCell(1, 'name').click();

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'name',
    targetType: 'cell',
  });
});

it('mouseover', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mouseover', callback);

  cy.getCell(1, 'name').trigger('mouseover');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'name',
    targetType: 'cell',
  });
});

it('mousedown', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mousedown', callback);

  cy.getCell(1, 'name').trigger('mousedown');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'name',
    targetType: 'cell',
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
    targetType: 'cell',
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
    onGridMounted: callback,
  });

  cy.wrap(callback).should('be.calledOnce');
});

it('onGridUpdated', () => {
  const callback = cy.stub();
  const newData = [{ name: 'Lee', age: 20 }];

  cy.createGrid({
    data,
    columns,
    onGridUpdated: callback,
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
    onGridBeforeDestroy: callback,
  });
  cy.gridInstance().invoke('destroy');

  cy.wrap(callback).should('be.calledOnce');
});

it('columnResize', () => {
  const stub = cy.stub();

  cy.gridInstance().invoke('on', 'columnResize', stub);

  cy.getByCls('column-resize-handle')
    .first()
    .trigger('mousedown')
    .trigger('mousemove', { pageX: 400 })
    .trigger('mouseup');

  cy.wrap(stub).should('be.calledWithMatch', {
    resizedColumns: [{ columnName: 'name', width: 271 }],
  });
});

describe('scrollEnd', () => {
  beforeEach(() => {
    const newData = Array.from({ length: 20 }).map((_, index) => ({
      name: `name${index}`,
      age: index,
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

  it('should not occur scrollEnd event after scrolling horizontally', () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'scrollEnd', callback);

    // scroll horizontally
    cy.focusAndWait(10, 'age');

    cy.wrap(callback).should('not.be.called');
  });

  it('should not occur scrollEnd event after calling resetData API', () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'scrollEnd', callback);

    // scroll at the vertically
    cy.focusAndWait(10, 'name');

    cy.gridInstance().invoke('resetData', []);

    cy.wrap(callback).should('not.be.called');
  });
});

describe('focus', () => {
  ['UI', 'API'].forEach((type) => {
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
        prevColumnName: null,
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
        prevColumnName: 'name',
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
  ['UI', 'API'].forEach((type) => {
    it(`check / uncheck by ${type}`, () => {
      const checkCallback = cy.stub();
      const uncheckCallback = cy.stub();

      cy.getByCls('cell-row-header').get('input').eq(1).as('checkbox');

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

      cy.getByCls('cell-row-header').get('input').eq(0).as('checkbox');

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

    it(`checkBetween / uncheckBetween by ${type}`, () => {
      cy.createGrid({
        data: [...data, ...data],
        columns,
        draggable: true,
        bodyHeight: 150,
        width: 500,
        rowHeaders: ['rowNum', 'checkbox'],
      });

      const checkCallback = cy.stub();
      const uncheckCallback = cy.stub();

      cy.getByCls('cell-row-header').get('input').eq(1).as('firstCheckbox');
      cy.getByCls('cell-row-header').get('input').eq(2).as('secondCheckbox');
      cy.getByCls('cell-row-header').get('input').eq(-1).as('lastCheckbox');

      cy.gridInstance().invoke('on', 'check', checkCallback);
      cy.gridInstance().invoke('on', 'uncheck', uncheckCallback);

      if (type === 'UI') {
        // In Cypress 4.9.0, there is no way to test Shift-click
        // cy.get('@secondCheckbox').click();
        // cy.get('@firstCheckbox').click();
        // cy.get('@lastCheckbox').click({
        //   shiftKey: true, // not available in Cypress 4.9.0
        // });
      } else {
        cy.gridInstance().invoke('check', 1);
        cy.gridInstance().invoke('checkBetween', 0, 3);

        cy.wrap(checkCallback).should('be.calledWithMatch', { rowKeys: [0, 2, 3] });
      }

      if (type === 'UI') {
        // In Cypress 4.9.0, there is no way to test Shift-click
        // cy.get('@secondCheckbox').click();
        // cy.get('@firstCheckbox').click();
        // cy.get('@lastCheckbox').click({
        //   shiftKey: true, // not available in Cypress 4.9.0
        // });
      } else {
        cy.gridInstance().invoke('uncheck', 1);
        cy.gridInstance().invoke('uncheckBetween', 0, 3);

        cy.wrap(uncheckCallback).should('be.calledWithMatch', { rowKeys: [0, 2, 3] });
      }
    });
  });
});

['UI', 'API'].forEach((type) => {
  it(`beforeSort by ${type}`, () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'beforeSort', callback);

    if (type === 'UI') {
      cy.getByCls('btn-sorting').click();
    } else {
      cy.gridInstance().invoke('sort', 'name', true);
    }

    cy.wrap(callback).should('be.calledWithMatch', {
      sortState: { columns: [{ columnName: 'sortKey', ascending: true }], useClient: true },
      columnName: 'name',
      ascending: true,
      multiple: false,
    });
  });

  it(`afterSort by ${type}`, () => {
    const sortCallback = cy.stub();
    const afterSortCallback = cy.stub();

    // @TODO: `sort` event will be deprecated. This event is replaced with `afterSort` event
    cy.gridInstance().invoke('on', 'sort', sortCallback);
    cy.gridInstance().invoke('on', 'afterSort', afterSortCallback);

    if (type === 'UI') {
      cy.getByCls('btn-sorting').click();
    } else {
      cy.gridInstance().invoke('sort', 'name', true);
    }

    cy.wrap(sortCallback).should('be.calledWithMatch', {
      sortState: { columns: [{ columnName: 'name', ascending: true }], useClient: true },
      columnName: 'name',
    });
    cy.wrap(afterSortCallback).should('be.calledWithMatch', {
      sortState: { columns: [{ columnName: 'name', ascending: true }], useClient: true },
      columnName: 'name',
    });
  });

  it(`beforeUnsort by ${type}`, () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'beforeUnsort', callback);
    cy.gridInstance().invoke('sort', 'name', false);

    if (type === 'UI') {
      cy.getByCls('btn-sorting').click();
    } else {
      cy.gridInstance().invoke('unsort', 'name');
    }

    cy.wrap(callback).should('be.calledWithMatch', {
      sortState: { columns: [{ columnName: 'name', ascending: false }], useClient: true },
      columnName: 'name',
    });
  });

  it(`afterUnsort by ${type}`, () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'afterUnsort', callback);
    cy.gridInstance().invoke('sort', 'name', false);

    if (type === 'UI') {
      cy.getByCls('btn-sorting').click();
    } else {
      cy.gridInstance().invoke('unsort', 'name');
    }

    cy.wrap(callback).should('be.calledWithMatch', {
      sortState: { columns: [{ columnName: 'sortKey', ascending: true }], useClient: true },
      columnName: 'name',
    });
  });
});

describe('editing', () => {
  ['API', 'UI'].forEach((type) => {
    it(`editingStart by ${type}`, () => {
      const callback = cy.stub();
      cy.gridInstance().invoke('on', 'editingStart', callback);

      if (type === 'UI') {
        cy.gridInstance().invoke('focus', 0, 'name');
        clipboardType('{enter}');
      } else {
        cy.gridInstance().invoke('startEditing', 0, 'name');
      }

      cy.wrap(callback).should('be.calledWithMatch', {
        rowKey: 0,
        columnName: 'name',
        value: 'Kim',
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
        value: 'Kim',
        triggeredByKey: false,
        save: true,
      });
    });
  });

  it('editingFinish by keymap(Enter)', () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'editingFinish', callback);

    cy.gridInstance().invoke('startEditing', 0, 'name');

    cy.getByCls('layer-editing').trigger('keydown', { keyCode: 13, which: 13, force: true });

    cy.wrap(callback).should('be.calledWithMatch', {
      rowKey: 0,
      columnName: 'name',
      value: 'Kim',
      triggeredByKey: true,
      save: true,
    });
  });

  it('editingFinish by keymap(Esc)', () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'editingFinish', callback);

    cy.gridInstance().invoke('startEditing', 0, 'name');

    cy.getByCls('layer-editing').trigger('keydown', { keyCode: 27, which: 27, force: true });

    cy.wrap(callback).should('be.calledWithMatch', {
      rowKey: 0,
      columnName: 'name',
      value: 'Kim',
      triggeredByKey: true,
      save: false,
    });
  });
});

describe('filter', () => {
  function applyFilterByUI(value: string) {
    clickFilterBtn();
    inputFilterValue(value);
  }

  ['API', 'UI'].forEach((type) => {
    it(`beforeFilter by ${type}`, () => {
      const callback = cy.stub();
      const columnFilterState = [{ code: 'eq', value: '20' }];

      cy.gridInstance().invoke('on', 'beforeFilter', callback);

      if (type === 'UI') {
        applyFilterByUI('20');
      } else {
        cy.gridInstance().invoke('filter', 'age', columnFilterState);
      }

      cy.wrap(callback).should('be.calledWithMatch', {
        columnName: 'age',
        filterState: null,
        type: 'number',
        columnFilterState,
      });
    });

    it(`afterFilter by ${type}`, () => {
      const filterCallback = cy.stub();
      const afterFilterCallback = cy.stub();

      // @TODO: `filter` event will be deprecated. This event is replaced with `afterFilter` event
      cy.gridInstance().invoke('on', 'filter', filterCallback);
      cy.gridInstance().invoke('on', 'afterFilter', afterFilterCallback);

      if (type === 'UI') {
        applyFilterByUI('20');
      } else {
        cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: '20' }]);
      }

      cy.wrap(filterCallback).should(() => {
        expect(filterCallback.args[0][0]).to.contain.subset({
          columnName: 'age',
          filterState: [
            { columnName: 'age', state: [{ code: 'eq', value: '20' }], type: 'number' },
          ],
        });
      });
      cy.wrap(afterFilterCallback).should(() => {
        expect(afterFilterCallback.args[0][0]).to.contain.subset({
          columnName: 'age',
          filterState: [
            { columnName: 'age', state: [{ code: 'eq', value: '20' }], type: 'number' },
          ],
        });
      });
    });

    it(`afterUnfilter by ${type}`, () => {
      const callback = cy.stub();

      cy.gridInstance().invoke('on', 'beforeUnfilter', callback);
      cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: '20' }]);

      if (type === 'UI') {
        applyFilterByUI('{backspace}{backspace}');
      } else {
        cy.gridInstance().invoke('unfilter', 'age');
      }

      cy.wrap(callback).should(() => {
        expect(callback.args[0][0]).to.contain.subset({
          columnName: 'age',
          filterState: null,
        });
      });
    });
  });

  it(`beforeUnfilter by API`, () => {
    const callback = cy.stub();

    cy.gridInstance().invoke('on', 'beforeUnfilter', callback);
    cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: '20' }]);

    // @TODO: UI state is not applied to grid properly due to cypress type().
    // if (type === 'UI') {
    //   applyFilterByUI('{backspace}{backspace}');
    // }
    cy.gridInstance().invoke('unfilter', 'age');

    cy.wrap(callback).should(() => {
      expect(callback.args[0][0]).to.contain.subset({
        columnName: 'age',
        filterState: [{ columnName: 'age', state: [{ code: 'eq', value: '20' }], type: 'number' }],
      });
    });
  });
});

describe('beforeChange, afterChange', () => {
  ['UI', 'API'].forEach((type) => {
    it(`should trigger beforeChange, afterChange event when changing the cell value by ${type}`, () => {
      const callback = cy.stub();

      cy.gridInstance().invoke('on', 'beforeChange', callback);
      cy.gridInstance().invoke('on', 'afterChange', callback);

      cy.gridInstance().invoke('setValue', 0, 'name', 'Test');

      cy.wrap(callback).should('be.calledWithMatch', {
        origin: 'cell',
        changes: [{ rowKey: 0, columnName: 'name', value: 'Kim', nextValue: 'Test' }],
      });

      callback.resetHistory();

      cy.wrap(callback).should('be.calledWithMatch', {
        origin: 'cell',
        changes: [{ rowKey: 0, columnName: 'name', prevValue: 'Kim', value: 'Test' }],
      });
      cy.getRsideBody().should('have.cellData', [
        ['Test', '10'],
        ['Lee', '20'],
      ]);
    });
  });

  ['backspace', 'del'].forEach((key) => {
    it(`should trigger beforeChange, afterChange event when deleting selection content by pressing ${key}`, () => {
      const callback = cy.stub();

      cy.gridInstance().invoke('on', 'beforeChange', callback);
      cy.gridInstance().invoke('on', 'afterChange', callback);

      cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [1, 0] });
      clipboardType('{backspace}');

      cy.wrap(callback).should('be.calledWithMatch', {
        origin: 'delete',
        changes: [
          { rowKey: 0, columnName: 'name', value: 'Kim', nextValue: '' },
          { rowKey: 1, columnName: 'name', value: 'Lee', nextValue: '' },
        ],
      });

      callback.resetHistory();

      cy.wrap(callback).should('be.calledWithMatch', {
        origin: 'delete',
        changes: [
          { rowKey: 0, columnName: 'name', prevValue: 'Kim', value: '' },
          { rowKey: 1, columnName: 'name', prevValue: 'Lee', value: '' },
        ],
      });
      cy.getRsideBody().should('have.cellData', [
        ['', '10'],
        ['', '20'],
      ]);
    });
  });

  it('should not delete selection content when event is stopped', () => {
    const before = cy.stub();
    const after = cy.stub();

    cy.gridInstance().invoke('on', 'beforeChange', (ev: GridEventProps & GridEvent) => {
      before(ev);
      ev.stop();
    });
    cy.gridInstance().invoke('on', 'afterChange', after);

    cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [1, 0] });
    clipboardType('{backspace}');

    cy.wrap(before).should('be.calledWithMatch', {
      origin: 'delete',
      changes: [
        { rowKey: 0, columnName: 'name', value: 'Kim', nextValue: '' },
        { rowKey: 1, columnName: 'name', value: 'Lee', nextValue: '' },
      ],
    });

    cy.wrap(after).should('not.be.called');
    cy.getRsideBody().should('have.cellData', [
      ['Kim', '10'],
      ['Lee', '20'],
    ]);
  });

  it('change the target value through beforeChange event when changing the cell value', () => {
    cy.gridInstance().invoke('on', 'beforeChange', (ev: GridEventProps & GridEvent) => {
      ev.changes![0].nextValue = 'Changed';
    });

    cy.gridInstance().invoke('setValue', 0, 'name', 'Ryu');

    cy.getRsideBody().should('have.cellData', [
      ['Changed', '10'],
      ['Lee', '20'],
    ]);
  });

  it('change the target value through beforeChange event when deleting the content', () => {
    cy.gridInstance().invoke('on', 'beforeChange', (ev: GridEventProps & GridEvent) => {
      ev.changes![0].nextValue = 'Changed';
    });

    cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [1, 0] });
    clipboardType('{backspace}');

    cy.getRsideBody().should('have.cellData', [
      ['Changed', '10'],
      ['', '20'],
    ]);
  });
  // @TODO: add test case when pasting the data
});

describe('D&D', () => {
  it('dragStart event', () => {
    const stub = cy.stub();

    cy.gridInstance().invoke('on', 'dragStart', stub);
    cy.getCell(0, '_draggable')
      .trigger('mousedown')
      .then(() => {
        cy.getByCls('floating-row').then((floatingRow) => {
          cy.wrap(stub).should('be.calledWithMatch', {
            rowKey: 0,
            floatingRow: floatingRow[0],
          });
        });
      });
  });

  it('drag event', () => {
    const stub = cy.stub();
    cy.gridInstance().invoke('on', 'drag', stub);

    cy.getCell(0, '_draggable')
      .trigger('mousedown')
      .trigger('mousemove', { pageY: 100, force: true });

    cy.wrap(stub).should('be.calledWithMatch', {
      rowKey: 0,
      targetRowKey: 1,
      appended: false,
    });
  });

  it('drop event', () => {
    const stub = cy.stub();
    cy.gridInstance().invoke('on', 'drop', stub);

    cy.getCell(0, '_draggable')
      .trigger('mousedown')
      .trigger('mousemove', { pageY: 100, force: true })
      .trigger('mouseup', { force: true });

    cy.wrap(stub).should('be.calledWithMatch', {
      rowKey: 0,
      targetRowKey: 1,
      appended: false,
    });
  });
});

it('keydown', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'keydown', callback);

  cy.gridInstance().invoke('focus', 1, 'name');
  clipboardType('{downArrow}');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'name',
  });
});
