import { cls } from '@/helper/dom';
import GridEvent from '@/event/gridEvent';
import { isSubsetOf } from '../helper/compare';

const data = [{ name: 'Kim', age: 10 }, { name: 'Lee', age: 20 }];
const columns = [
  { name: 'name', editor: 'text', resizable: true, sortable: true },
  { name: 'age' }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });

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
      expect(isSubsetOf({ rowKey: 1, columnName: 'name', targetType: 'cell' }, callback.args[0][0]))
        .to.be.true;
    });
});

it('mouseover', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mouseover', callback);

  cy.getCell(1, 'name')
    .trigger('mouseover')
    .then(() => {
      expect(isSubsetOf({ rowKey: 1, columnName: 'name', targetType: 'cell' }, callback.args[0][0]))
        .to.be.true;
    });
});

it('mousedown', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'mousedown', callback);

  cy.getCell(1, 'name')
    .trigger('mousedown')
    .then(() => {
      expect(isSubsetOf({ rowKey: 1, columnName: 'name', targetType: 'cell' }, callback.args[0][0]))
        .to.be.true;
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
      expect(isSubsetOf({ rowKey: 1, columnName: 'name', targetType: 'cell' }, callback.args[0][0]))
        .to.be.true;
    });
});

it('dblclick', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'dblclick', callback);

  cy.get(`.${cls('container')}`)
    .dblclick()
    .then(() => {
      expect(isSubsetOf({ targetType: 'etc' }, callback.args[0][0])).to.be.true;
    });
});

it('focus change', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'focusChange', callback);

  cy.getCell(0, 'name')
    .click()
    .then(() => {
      expect(
        isSubsetOf(
          { rowKey: 0, columnName: 'name', prevRowKey: null, prevColumnName: null },
          callback.args[0][0]
        )
      ).to.be.true;
    });
  cy.getCell(1, 'age')
    .click()
    .then(() => {
      expect(
        isSubsetOf(
          { rowKey: 1, columnName: 'age', prevRowKey: 0, prevColumnName: 'name' },
          callback.args[1][0]
        )
      ).to.be.true;
    });
});

it('focus change by api', () => {
  const callback = cy.stub();
  cy.gridInstance().invoke('on', 'focusChange', callback);

  cy.gridInstance()
    .invoke('focus', 0, 'name')
    .then(() => {
      expect(
        isSubsetOf(
          { rowKey: 0, columnName: 'name', prevRowKey: null, prevColumnName: null },
          callback.args[0][0]
        )
      ).to.be.true;
    });

  cy.gridInstance()
    .invoke('blur')
    .then(() => {
      expect(
        isSubsetOf(
          { rowKey: null, columnName: null, prevRowKey: 0, prevColumnName: 'name' },
          callback.args[1][0]
        )
      ).to.be.true;
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
      expect(isSubsetOf({ rowKey: 0 }, checkCallback.args[0][0])).to.be.true;
    })
    .click()
    .then(() => {
      expect(isSubsetOf({ rowKey: 0 }, uncheckCallback.args[0][0])).to.be.true;
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
      expect(isSubsetOf({ range: { column: [0, 1], row: [0, 1] } }, callback.args[0][0])).to.be
        .true;
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
      expect(
        isSubsetOf(
          { sortState: { columns: [{ columnName: 'name', ascending: false }], useClient: true } },
          callback.args[0][0]
        )
      ).to.be.true;
    });
});

it('gridMounted', () => {
  const callback = cy.stub();

  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });

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

it('columnResize', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'columnResize', callback);

  cy.get(`.${cls('column-resize-handle')}`)
    .first()
    .trigger('mousedown')
    .trigger('mousemove', { pageX: 400 })
    .trigger('mouseup')
    .should(() => {
      expect(isSubsetOf({ columnName: 'name', width: 311 }, callback.args[0][0])).to.be.true;
    });
});

it('editingStart', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'editingStart', callback);

  cy.gridInstance()
    .invoke('startEditing', 0, 'name')
    .should(() => {
      expect(isSubsetOf({ rowKey: 0, columnName: 'name', value: 'Kim' }, callback.args[0][0])).to.be
        .true;
    });
});

it('editingFinish', () => {
  const callback = cy.stub();

  cy.gridInstance().invoke('on', 'editingFinish', callback);

  cy.gridInstance()
    .invoke('finishEditing', 0, 'name', 'Ryu')
    .should(() => {
      expect(isSubsetOf({ rowKey: 0, columnName: 'name', value: 'Ryu' }, callback.args[0][0])).to.be
        .true;
    });
});
