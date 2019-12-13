import GridEvent from '@/event/gridEvent';
import { createCustomLayerEditor } from '../helper/customLayerEditor';

before(() => {
  cy.visit('/dist');
});

function createGridWithCallback(beforeCallback: Function, afterCallback: Function) {
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 }
  ];
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
}

function createGridWithEditingFinishEvent(stub: Function) {
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
    { name: 'Ryu', age: 22 }
  ];
  const columns = [
    { name: 'name', editor: 'text' },
    { name: 'age', editor: 'text' }
  ];

  cy.createGrid({ data, columns, rowHeaders: ['rowNum'] });
  cy.gridInstance().invoke('on', 'editingFinish', stub);
}

function createGridWithCustomEditor(stub: Function) {
  const CustomLayerEditor = createCustomLayerEditor(stub);
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
    { name: 'Ryu', age: 22 }
  ];
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
}

describe('with interaction', () => {
  beforeEach(() => {
    const data = [
      { name: 'Lee', age: 20 },
      { name: 'Han', age: 28 }
    ];
    const columns = [
      {
        name: 'name',
        editor: 'text'
      },
      { name: 'age' }
    ];
    cy.createGrid({ data, columns });
  });

  it('should render the editing layer', () => {
    cy.getCell(1, 'name')
      .click()
      .trigger('dblclick');

    cy.getByCls('layer-editing').should('be.visible');
  });

  it('should destroy the editing layer, when focus layer is changed', () => {
    cy.gridInstance().invoke('startEditing', 0, 'name');
    cy.getCell(1, 'name').click();

    cy.getByCls('layer-editing').should('be.not.visible');
  });
});

describe('onBeforeChange, onAfterChange', () => {
  it('onBeforeChange, onAfterChange does not fire if the value is the same as before', () => {
    const beforeCallback = cy.stub();
    const afterCallback = cy.stub();

    createGridWithCallback(beforeCallback, afterCallback);

    cy.gridInstance().invoke('startEditing', 0, 'name');
    cy.gridInstance().invoke('finishEditing', 0, 'name');

    cy.wrap(beforeCallback).should('be.not.called');
    cy.wrap(afterCallback).should('be.not.called');
  });

  it('onBeforeChange, onAfterChange must be called with gridEvent object', () => {
    const beforeCallback = cy.stub();
    const afterCallback = cy.stub();

    createGridWithCallback(beforeCallback, afterCallback);

    cy.gridInstance().invoke('startEditing', 0, 'name');
    cy.getByCls('content-text').type('Kim');
    cy.gridInstance().invoke('finishEditing', 0, 'name');

    cy.wrap(beforeCallback)
      .should('be.calledOnce')
      .and('calledWithMatch', { rowKey: 0, columnName: 'name', value: 'Kim' });
    cy.wrap(afterCallback)
      .should('be.calledOnce')
      .and('calledWithMatch', { rowKey: 0, columnName: 'name', value: 'Kim' });
  });

  it('If gridEvent "stop" occurs in beforeChange, setValue does not occur.', () => {
    const beforeCallback = (ev: GridEvent) => {
      ev.stop();
    };
    const afterCallback = cy.stub();

    createGridWithCallback(beforeCallback, afterCallback);

    cy.wrap(afterCallback).should('be.not.called');
    cy.getCellContent(0, 'name').should('have.text', 'Lee');
  });
});

describe('custom editor', () => {
  it('should render custom editor properly', () => {
    const stub = cy.stub();
    createGridWithCustomEditor(stub);

    cy.gridInstance().invoke('startEditing', 0, 'name');

    cy.get('.custom-editor-layer').should('be.visible');

    cy.getCell(1, 'name').click();

    cy.get('.custom-editor-layer').should('be.not.visible');
    cy.wrap(stub).should('be.calledOnce');
  });
});

describe('API', () => {
  const listForFinishEditingTest = [
    {
      type: 'finishEditing(rowKey, columnName, value)',
      params: [1, 'name', 'Choi'],
      editedValue: 'Kim',
      result: 'Choi'
    },
    {
      type: 'finishEditing(rowKey, columnName)',
      params: [1, 'name'],
      editedValue: 'Kim',
      result: 'Kim'
    },
    {
      type: 'finishEditing()',
      params: [],
      editedValue: 'Kim',
      result: 'Kim'
    }
  ];

  beforeEach(() => {
    const data = [
      { name: 'Lee', age: 20 },
      { name: 'Han', age: 28 },
      { name: 'Ryu', age: 22 }
    ];
    const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

    cy.createGrid({ data, columns });
  });

  ['startEditing', 'startEditingAt'].forEach(api => {
    it(`${api}()`, () => {
      if (api === 'startEditing') {
        cy.gridInstance().invoke(api, 1, 'name');
      } else {
        cy.gridInstance().invoke(api, 1, 0);
      }

      cy.getByCls('content-text').should('be.visible');
    });
  });

  listForFinishEditingTest.forEach(obj => {
    const { type, params, editedValue, result } = obj;
    it(type, () => {
      cy.gridInstance().invoke('startEditing', 0, 'name');
      cy.getByCls('content-text').type(editedValue);
      cy.gridInstance().invoke('finishEditing', ...params);

      cy.getCell(0, 'name').should('have.text', result);
    });
  });

  it('cancelEditing', () => {
    cy.gridInstance().invoke('startEditing', 0, 'name');
    cy.getByCls('content-text').type('Kim');
    cy.gridInstance().invoke('cancelEditing');

    cy.getCell(0, 'name').should('have.text', 'Lee');
  });
});

describe('editable, disable, hidden', () => {
  beforeEach(() => {
    const data = [
      { name: 'Lee', age: 20 },
      { name: 'Han', age: 28 },
      { name: 'Ryu', age: 22 }
    ];
    const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

    cy.createGrid({ data, columns });
  });

  it('cannot edit the value on disabled cell', () => {
    cy.gridInstance().invoke('disable');
    cy.gridInstance().invoke('startEditingAt', 1, 0);

    cy.getByCls('layer-editing').should('be.not.visible');

    cy.gridInstance().invoke('finishEditing', 1, 0, 'Choi');

    cy.getCell(1, 'name').should('have.text', 'Han');
  });

  it('cannot edit the value on non editable cell', () => {
    cy.gridInstance().invoke('startEditing', 0, 'age');

    cy.getByCls('layer-editing').should('be.not.visible');

    cy.gridInstance().invoke('finishEditing', 0, 'age', 11);

    cy.getCell(0, 'age').should('have.text', '20');
  });

  it('cannot edit the value on hidden cell', () => {
    cy.gridInstance().invoke('hideColumn', 'name');
    cy.gridInstance().invoke('startEditing', 0, 'name');

    cy.getByCls('layer-editing').should('be.not.visible');
  });

  it('cannot save the value and finish the editing on hidden cell', () => {
    cy.gridInstance().invoke('hideColumn', 'name');
    cy.gridInstance().invoke('finishEditing', 0, 'name', 'Park');

    cy.getByCls('layer-editing').should('be.not.visible');
  });
});

it('should do syncronous renering of the editing cell', () => {
  const stub = cy.stub();
  createGridWithEditingFinishEvent(stub);

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.getByCls('content-text').type('Kim');
  cy.gridInstance().invoke('finishEditing', 0, 'name');

  cy.getCell(0, 'name').should('have.text', 'Kim');

  cy.gridInstance().invoke('startEditing', 1, 'name');

  cy.getByCls('content-text')
    .invoke('val')
    .should('eq', 'Han');

  cy.wrap(stub)
    .should('be.calledOnce')
    .and('be.calledWithMatch', { rowKey: 0, columnName: 'name', value: 'Kim' });
});

['rowHeader', 'columnHeader'].forEach(type => {
  it(`finish editing when ${type} is clicked`, () => {
    const stub = cy.stub();
    createGridWithEditingFinishEvent(stub);

    cy.gridInstance().invoke('startEditing', 1, 'name');

    if (type === 'columnHeader') {
      cy.getHeaderCell('name').as('targetCell');
    } else {
      cy.getRowHeaderCell(1).as('targetCell');
    }

    cy.get('@targetCell').click();

    cy.wrap(stub)
      .should('be.calledOnce')
      .and('calledWithMatch', { rowKey: 1, columnName: 'name' });
  });
});

// @TODO: should rewrite test case after modifying casting editing value
// it('should maintain the type of value in case of finishing editing without any modification', () => {
//   const data = [
//     { name: 'Lee', age: 20 },
//     { name: 'Han', age: 28 }
//   ];
//   const columns = [
//     {
//       name: 'name',
//       editor: 'text'
//     },
//     { name: 'age', editor: 'text' }
//   ];
//   cy.createGrid({ data, columns });
//   cy.gridInstance().invoke('startEditing', 0, 'age');
//   cy.getCell(0, 'name').click();

//   cy.gridInstance()
//     .invoke('getValue', 0, 'age')
//     .should('eq', 20);
// });

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
