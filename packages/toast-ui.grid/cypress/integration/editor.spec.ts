import { cls } from '@/helper/dom';
import GridEvent from '@/event/gridEvent';
import { createCustomLayerEditor } from '../helper/customLayerEditor';

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

it('onBeforeChange, onAfterChange does not fire if the value is the same as before', () => {
  const beforeCallback = cy.stub();
  const afterCallback = cy.stub();
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }];
  const columns = [
    {
      name: 'name',
      editor: 'text',
      onBeforeChange: beforeCallback,
      onAfterChange: afterCallback
    },
    { name: 'age' }
  ];

  cy.createGrid({ data, columns });

  // Click(focus) is not Preferentially occur when double click on cypress test.
  // So, Explicitly triggers a click.
  cy.getCell(0, 'name')
    .click()
    .trigger('dblclick');
  cy.getCell(1, 'age')
    .click()
    .then(() => {
      expect(beforeCallback).not.to.be.called;
      expect(afterCallback).not.to.be.called;
    });
});

it('onBeforeChange / onAfterChange must be called with gridEvent object', () => {
  const beforeCallback = cy.stub();
  const afterCallback = cy.stub();
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }];
  const columns = [
    {
      name: 'name',
      editor: 'text',
      onBeforeChange: beforeCallback,
      onAfterChange: afterCallback
    },
    { name: 'age' }
  ];

  cy.createGrid({ data, columns });

  cy.getCell(0, 'name')
    .click()
    .trigger('dblclick')
    .then(() => {
      cy.get(`.${cls('content-text')}`).type('Kim');
    });
  cy.getCell(1, 'age')
    .click()
    .then(() => {
      expect(beforeCallback.args[0][0]).to.contain({ rowKey: 0, columnName: 'name', value: 'Kim' });
      expect(afterCallback.args[0][0]).to.contain({ rowKey: 0, columnName: 'name', value: 'Kim' });
    });
});

it('If gridEvent "stop" occurs in beforeChange, setValue does not occur.', () => {
  const callback = cy.stub();
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }];
  const columns = [
    {
      name: 'name',
      editor: 'text',
      onBeforeChange: (ev: GridEvent) => {
        ev.stop();
      },
      onAfterChange: callback
    },
    { name: 'age' }
  ];

  cy.createGrid({ data, columns });

  cy.getCell(0, 'name')
    .click()
    .trigger('dblclick')
    .then(() => {
      cy.get(`.${cls('content-text')}`).type('Kim');
    });

  cy.getCell(1, 'age')
    .click()
    .then(() => {
      expect(callback).not.to.be.called;
    });

  cy.getCellContent(0, 'name').should('have.text', 'Lee');
});

it('should destroy the editing layer, when only focus layer is changed.', () => {
  const stub = cy.stub();
  const CustomLayerEditor = createCustomLayerEditor(stub);
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [
    {
      name: 'name',
      editor: {
        type: CustomLayerEditor
      }
    },
    { name: 'age' }
  ];

  cy.createGrid({ data, columns });
  cy.createStyle(`
    .custom-editor-layer {
      width: 300px;
      height: 300px;
      left: 55%;
      top: 50%;
      position: absolute;
      border: 1px solid #000;
      z-index: 25;
      text-align: center;
      line-height: 300px;
      background-color: #fff;
    }
  `);

  cy.getCell(0, 'name')
    .click()
    .trigger('dblclick');

  cy.getCell(1, 'name')
    .click()
    .trigger('mousedown')
    .then(() => {
      expect(stub).to.be.calledOnce;
    });

  cy.getCell(1, 'name')
    .click()
    .trigger('dblclick');

  cy.get(`.${cls('layer-editing')}`)
    .click()
    .within(() => {
      cy.get('.custom-editor-layer')
        .click()
        .then(() => {
          expect(stub).to.be.calledTwice;
        });
    });
});

it('startEditing API', () => {
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('startEditing', 1, 'name');
  cy.getCell(1, 'name')
    .get(`.${cls('content-text')}`)
    .should('be.visible');
});

it('startEditingAt API', () => {
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('startEditingAt', 1, 0);
  cy.getCell(1, 'name')
    .get(`.${cls('content-text')}`)
    .should('be.visible');
});

it('cannot edit the value on disabled cell', () => {
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('disable');
  cy.gridInstance().invoke('startEditingAt', 1, 0);
  cy.getCell(1, 'name')
    .get(`.${cls('content-text')}`)
    .should('be.not.visible');

  cy.getCell(1, 'name')
    .trigger('mousedown')
    .trigger('mouseup');

  cy.get(`.${cls('clipboard')}`).trigger('keydown', { keyCode: 13, which: 13, force: true });

  cy.get(`.${cls('content-text')}`).should('be.not.visible');
});

it('cannot save the value and finish the editing on non editable cell', () => {
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('finishEditing', 0, 'age', 11);
  cy.getCell(0, 'age').should('have.text', '20');

  cy.gridInstance().invoke('disable');
  cy.gridInstance().invoke('finishEditing', 0, 'name', 'Park');
  cy.getCell(0, 'name').should('have.text', 'Lee');
});

it('should destroy the editing layer, when hide the column', () => {
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age', editor: 'text' }];

  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.gridInstance().invoke('hideColumn', 'name');

  cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
});

it('cannot edit the value on hidden cell', () => {
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age', editor: 'text' }];

  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('hideColumn', 'name');
  cy.gridInstance().invoke('startEditing', 0, 'name');

  cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
});

it('cannot save the value and finish the editing on hidden cell', () => {
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age', editor: 'text' }];

  cy.createGrid({ data, columns });
  cy.gridInstance().invoke('hideColumn', 'name');
  cy.gridInstance().invoke('finishEditing', 0, 'name', 'Park');

  cy.get(`.${cls('layer-editing')}`).should('not.be.visible');
});

it('should renering of the editing cell is syncronous', () => {
  const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age', editor: 'text' }];
  const stub = cy.stub();

  cy.createGrid({ data, columns });

  cy.gridInstance().invoke('on', 'editingFinish', stub);

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.get(`.${cls('content-text')}`).type('Kim');
  cy.gridInstance().invoke('finishEditing', 0, 'name');

  cy.gridInstance()
    .invoke('getValue', 0, 'name')
    .should('eq', 'Kim');

  cy.gridInstance().invoke('startEditing', 1, 'name');
  cy.get(`.${cls('content-text')}`)
    .invoke('val')
    .should('eq', 'Han')
    .and(() => {
      expect(stub).to.be.calledOnce;
      expect(stub.args[0][0]).to.contain({ rowKey: 0, columnName: 'name', value: 'Kim' });
    });
});

['rowHeader', 'columnHeader'].forEach(type => {
  it(`finish editing when ${type} is clicked`, () => {
    const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
    const columns = [{ name: 'name', editor: 'text' }, { name: 'age', editor: 'text' }];
    const stub = cy.stub();

    cy.createGrid({ data, columns, rowHeaders: ['rowNum'] });

    cy.gridInstance().invoke('on', 'editingFinish', stub);
    cy.gridInstance().invoke('startEditing', 1, 'name');

    if (type === 'columnHeader') {
      cy.getHeaderCell('name').as('targetCell');
    } else {
      cy.getRowNumCell(1).as('targetCell');
    }

    cy.get('@targetCell').click();
    cy.wrap(stub)
      .should('be.calledOnce')
      .and('calledWithMatch', { rowKey: 1, columnName: 'name' });
  });
});

// @TODO: cannot pass the test in headless mode, need to ask this issue
// it('should not copy prev value as moving the editing cell by tab keyMap', () => {
//   const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
//   const columns = [{ name: 'name', editor: 'text' }, { name: 'age', editor: 'text' }];

//   cy.createGrid({ data, columns });
//   cy.gridInstance().invoke('startEditing', 0, 'name');
//   cy.get(`.${cls('content-text')}`).tab();

//   cy.get(`.${cls('content-text')}`)
//     .invoke('val')
//     .should('eq', '20');

//   cy.get(`.${cls('content-text')}`).tab({ shift: true });

//   cy.get(`.${cls('content-text')}`)
//     .invoke('val')
//     .should('eq', 'Lee');
// });

// it('should destroy the editing cell as next cell is not editable cell on moving by tab keyMap', () => {
//   const data = [{ name: 'Lee', age: 20 }, { name: 'Han', age: 28 }, { name: 'Ryu', age: 22 }];
//   const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

//   cy.createGrid({ data, columns });
//   cy.gridInstance().invoke('startEditing', 0, 'name');
//   cy.get(`.${cls('content-text')}`).tab();

//   cy.get(`.${cls('content-text')}`).should('be.not.visible');
// });
