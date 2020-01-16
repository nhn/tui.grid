import { cls } from '@/helper/dom';
import GridEvent from '@/event/gridEvent';

const data = [
  { name: 'Kim', age: 10 },
  { name: 'Lee', age: 20 }
];
const columns = [
  { name: 'name', editor: 'text', resizable: true, sortable: true },
  { name: 'age', filter: 'number' }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.createGrid({
    data,
    columns,
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

it('focus change', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'focusChange', callback);

  cy.getCell(0, 'name').click();

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 0,
    columnName: 'name',
    prevRowKey: null,
    prevColumnName: null
  });

  cy.getCell(1, 'age').click();

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 1,
    columnName: 'age',
    prevRowKey: 0,
    prevColumnName: 'name'
  });
});

it('focus change by api', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'focusChange', callback);

  cy.gridInstance().invoke('focus', 0, 'name');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 0,
    columnName: 'name',
    prevRowKey: null,
    prevColumnName: null
  });

  cy.gridInstance().invoke('blur');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: null,
    columnName: null,
    prevRowKey: 0,
    prevColumnName: 'name'
  });
});

it('focus stop', () => {
  cy.gridInstance().invoke('on', 'focusChange', (ev: GridEvent) => {
    ev.stop();
  });

  cy.getCell(0, 'name').click();

  cy.getByCls('layer-focus').should('not.exist');
});

it('check / uncheck', () => {
  const checkCallback = cy.stub();
  const uncheckCallback = cy.stub();

  cy.getByCls('cell-row-header')
    .get('input')
    .eq(1)
    .as('checkbox');

  cy.gridInstance().invoke('on', 'check', checkCallback);
  cy.gridInstance().invoke('on', 'uncheck', uncheckCallback);

  cy.get('@checkbox').click();

  cy.wrap(checkCallback).should('be.calledWithMatch', { rowKey: 0 });

  cy.get('@checkbox').click();

  cy.wrap(uncheckCallback).should('be.calledWithMatch', { rowKey: 0 });
});

it('checkAll / uncheckAll', () => {
  const checkCallback = cy.stub();
  const uncheckCallback = cy.stub();

  cy.getByCls('cell-row-header')
    .get('input')
    .eq(0)
    .as('checkbox');

  cy.gridInstance().invoke('on', 'checkAll', checkCallback);
  cy.gridInstance().invoke('on', 'uncheckAll', uncheckCallback);

  cy.get('@checkbox').click();

  cy.wrap(checkCallback).should('be.calledOnce');

  cy.get('@checkbox').click();

  cy.wrap(uncheckCallback).should('be.calledOnce');
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

it('sort', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'sort', callback);

  cy.gridInstance().invoke('sort', 'name', false);

  cy.wrap(callback).should('be.calledWithMatch', {
    sortState: { columns: [{ columnName: 'name', ascending: false }], useClient: true }
  });
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

  cy.get(`.${cls('column-resize-handle')}`)
    .first()
    .trigger('mousedown')
    .trigger('mousemove', { pageX: 400 })
    .trigger('mouseup');

  cy.wrap(callback).should('be.calledWithMatch', {
    resizedColumns: [{ columnName: 'name', width: 311 }]
  });
});

['API', 'UI'].forEach(method => {
  it(`editingStart by ${method}`, () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'editingStart', callback);

    if (method === 'API') {
      cy.gridInstance().invoke('startEditing', 0, 'name');
    } else {
      cy.gridInstance().invoke('focus', 0, 'name');
      cy.getByCls('clipboard').trigger('keydown', { keyCode: 13, which: 13, force: true });
    }

    cy.wrap(callback).should('be.calledWithMatch', {
      rowKey: 0,
      columnName: 'name',
      value: 'Kim'
    });
  });
});

it('editingFinish', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'editingFinish', callback);

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.gridInstance().invoke('finishEditing', 0, 'name', 'Ryu');

  cy.wrap(callback).should('be.calledWithMatch', {
    rowKey: 0,
    columnName: 'name',
    value: 'Ryu'
  });
});

it('filter', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'filter', callback);

  cy.gridInstance().invoke('filter', 'age', [{ code: 'eq', value: 20 }]);

  cy.wrap(callback).should(() => {
    expect(callback.args[0][0]).to.contain.subset({
      filterState: [{ columnName: 'age', state: [{ code: 'eq', value: 20 }], type: 'number' }]
    });
  });
});

it('when calling editingStart and editingFinish by API, both callback execute.', () => {
  const startCallback = cy.stub();
  const finishCallback = cy.stub();

  cy.gridInstance().invoke('on', 'editingStart', startCallback);
  cy.gridInstance().invoke('on', 'editingFinish', finishCallback);
  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.gridInstance().invoke('finishEditing');

  cy.should(() => {
    expect(startCallback.args[0][0]).to.contain.subset({
      rowKey: 0,
      columnName: 'name',
      value: 'Kim'
    });

    expect(finishCallback.args[0][0]).to.contain.subset({
      rowKey: 0,
      columnName: 'name',
      value: 'Kim'
    });
  });
});
