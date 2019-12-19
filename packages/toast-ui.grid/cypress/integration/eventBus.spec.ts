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

  cy.getCell(1, 'name')
    .click()
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({
        rowKey: 1,
        columnName: 'name',
        targetType: 'cell'
      });
    });
});

it('mouseover', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mouseover', callback);

  cy.getCell(1, 'name')
    .trigger('mouseover')
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({
        rowKey: 1,
        columnName: 'name',
        targetType: 'cell'
      });
    });
});

it('mousedown', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mousedown', callback);

  cy.getCell(1, 'name')
    .trigger('mousedown')
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({
        rowKey: 1,
        columnName: 'name',
        targetType: 'cell'
      });
    });
});

it('mousedown stop', () => {
  cy.gridInstance().invoke('on', 'mousedown', (ev: GridEvent) => {
    ev.stop();
  });

  cy.getCell(1, 'age')
    .trigger('mousedown')
    .then(() => {
      cy.get(`${cls('layer-focus')}`).should('not.exist');
    });
});

it('mouseout', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mouseout', callback);

  cy.getCell(1, 'name')
    .trigger('mouseout')
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({
        rowKey: 1,
        columnName: 'name',
        targetType: 'cell'
      });
    });
});

it('dblclick', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'dblclick', callback);

  cy.get(`.${cls('container')}`)
    .dblclick()
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({ targetType: 'etc' });
    });
});

it('focus change', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'focusChange', callback);

  cy.getCell(0, 'name')
    .click()
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({
        rowKey: 0,
        columnName: 'name',
        prevRowKey: null,
        prevColumnName: null
      });
    });
  cy.getCell(1, 'age')
    .click()
    .then(() => {
      expect(callback.args[1][0]).to.contain.subset({
        rowKey: 1,
        columnName: 'age',
        prevRowKey: 0,
        prevColumnName: 'name'
      });
    });
});

it('focus change by api', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'focusChange', callback);

  cy.gridInstance()
    .invoke('focus', 0, 'name')
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({
        rowKey: 0,
        columnName: 'name',
        prevRowKey: null,
        prevColumnName: null
      });
    });

  cy.gridInstance()
    .invoke('blur')
    .then(() => {
      expect(callback.args[1][0]).to.contain.subset({
        rowKey: null,
        columnName: null,
        prevRowKey: 0,
        prevColumnName: 'name'
      });
    });
});

it('focus stop', () => {
  cy.gridInstance().invoke('on', 'focusChange', (ev: GridEvent) => {
    ev.stop();
  });

  cy.getCell(0, 'name')
    .click()
    .then(() => {
      cy.get(`${cls('layer-focus')}`).should('not.exist');
    });
});

it('check / uncheck', () => {
  const checkCallback = cy.stub();
  const uncheckCallback = cy.stub();

  cy.gridInstance().invoke('on', 'check', checkCallback);
  cy.gridInstance().invoke('on', 'uncheck', uncheckCallback);

  cy.get(`.${cls('cell-row-header')}`)
    .get('input')
    .eq(1)
    .click()
    .then(() => {
      expect(checkCallback.args[0][0]).to.contain.subset({ rowKey: 0 });
    })
    .click()
    .then(() => {
      expect(uncheckCallback.args[0][0]).to.contain.subset({ rowKey: 0 });
    });
});

it('checkAll / uncheckAll', () => {
  const checkCallback = cy.stub();
  const uncheckCallback = cy.stub();

  cy.gridInstance().invoke('on', 'checkAll', checkCallback);
  cy.gridInstance().invoke('on', 'uncheckAll', uncheckCallback);

  cy.get(`.${cls('cell-row-header')}`)
    .get('input')
    .eq(0)
    .click()
    .then(() => {
      expect(checkCallback).to.be.called;
    });
  cy.get(`.${cls('cell-row-header')}`)
    .get('input')
    .eq(0)
    .click()
    .then(() => {
      expect(uncheckCallback).to.be.called;
    });
});

it('selection by api', () => {
  // keyboard, mouse event untestable
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'selection', callback);

  cy.gridInstance()
    .invoke('setSelectionRange', { start: [0, 0], end: [1, 1] })
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({ range: { column: [0, 1], row: [0, 1] } });
    });
});

it('off', () => {
  const callback1 = cy.stub();
  const callback2 = cy.stub();

  cy.gridInstance().invoke('on', 'click', callback1);
  cy.gridInstance().invoke('on', 'click', callback2);
  cy.gridInstance().invoke('off', 'click', callback1);

  cy.get(`.${cls('container')}`)
    .click()
    .then(() => {
      expect(callback1).not.to.be.called;
      expect(callback2).to.be.called;
    });

  cy.gridInstance().invoke('off', 'click');
  cy.get(`.${cls('container')}`)
    .click()
    .then(() => {
      expect(callback2).not.to.be.calledTwice;
    });
});

it('sort', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'sort', callback);

  cy.gridInstance()
    .invoke('sort', 'name', false)
    .then(() => {
      expect(callback.args[0][0]).to.contain.subset({
        sortState: { columns: [{ columnName: 'name', ascending: false }], useClient: true }
      });
    });
});

it('gridMounted', () => {
  const callback = cy.stub();

  cy.createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
    onGridMounted: callback
  }).then(() => {
    setTimeout(() => {
      expect(callback).to.be.calledOnce;
    });
  });
});

it('gridBeforeDestroy', () => {
  const callback = cy.stub();

  cy.createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
    onGridBeforeDestroy: callback
  });
  cy.gridInstance()
    .invoke('destroy')
    .should(() => {
      expect(callback).to.be.calledOnce;
    });
});

it('columnResize', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'columnResize', callback);

  cy.get(`.${cls('column-resize-handle')}`)
    .first()
    .trigger('mousedown')
    .trigger('mousemove', { pageX: 400 })
    .trigger('mouseup')
    .should(() => {
      expect(callback.args[0][0]).to.contain.subset({
        resizedColumns: [{ columnName: 'name', width: 311 }]
      });
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

    cy.should(() => {
      expect(callback.args[0][0]).to.contain.subset({
        rowKey: 0,
        columnName: 'name',
        value: 'Kim'
      });
    });
  });
});

it('editingFinish', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'editingFinish', callback);

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.gridInstance()
    .invoke('finishEditing', 0, 'name', 'Ryu')
    .should(() => {
      expect(callback.args[0][0]).to.contain.subset({
        rowKey: 0,
        columnName: 'name',
        value: 'Ryu'
      });
    });
});

it('filter', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'filter', callback);

  cy.gridInstance()
    .invoke('filter', 'age', [{ code: 'eq', value: 20 }])
    .should(() => {
      expect(callback.args[0][0]).to.contain.subset({
        filterState: [{ columnName: 'age', state: [{ code: 'eq', value: 20 }], type: 'number' }]
      });
    });
});
