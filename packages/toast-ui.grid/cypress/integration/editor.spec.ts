import GridEvent from '@/event/gridEvent';
import { CellValue } from '@t/store/data';
import { createCustomLayerEditor, CustomTextEditor } from '../helper/customEditor';
import { GridEventProps } from '@t/event';
import { clickFilterBtn } from '../helper/util';

before(() => {
  cy.visit('/dist');
});

function createGridWithCallback(beforeCallback: Function, afterCallback: Function) {
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
  ];
  const columns = [
    {
      name: 'name',
      editor: 'text',
      onBeforeChange: beforeCallback,
      onAfterChange: afterCallback,
    },
    { name: 'age' },
  ];
  cy.createGrid({ data, columns });
}

function createGridWithEditingFinishEvent(stub: Function) {
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
    { name: 'Ryu', age: 22 },
  ];
  const columns = [
    { name: 'name', editor: 'text' },
    { name: 'age', editor: 'text' },
  ];

  cy.createGrid({ data, columns, rowHeaders: ['rowNum'] });
  cy.gridInstance().invoke('on', 'editingFinish', stub);
}

function createGridWithEditingEvent() {
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
    { name: 'Ryu', age: 22 },
  ];
  const columns = [
    { name: 'name', editor: 'text' },
    { name: 'age', editor: 'text' },
  ];

  cy.createGrid({ data, columns, editingEvent: 'click' });
}

describe('with interaction', () => {
  beforeEach(() => {
    const data = [
      { name: 'Lee', age: 20 },
      { name: 'Han', age: 28 },
    ];
    const columns = [
      {
        name: 'name',
        editor: 'text',
        filter: 'select',
      },
      { name: 'age' },
    ];
    cy.createGrid({ data, columns });
  });

  it('should render the editing layer', () => {
    cy.getCell(1, 'name').click().trigger('dblclick');

    cy.getByCls('layer-editing').should('be.visible');
  });

  it('should destroy the editing layer, when focus layer is changed', () => {
    cy.gridInstance().invoke('startEditing', 0, 'name');
    cy.getCell(1, 'name').click();

    cy.getByCls('layer-editing').should('be.not.visible');
  });

  it('should destroy the editing later and save editing, when filter button clicked', () => {
    cy.gridInstance().invoke('startEditing', 0, 'name');
    cy.getByCls('content-text').type('Kim');

    clickFilterBtn();

    cy.getCell(0, 'name').should('have.text', 'Kim');
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
      .and('calledWithMatch', { rowKey: 0, columnName: 'name', value: 'Lee', nextValue: 'Kim' });
    cy.wrap(afterCallback)
      .should('be.calledOnce')
      .and('calledWithMatch', { rowKey: 0, columnName: 'name', value: 'Kim', prevValue: 'Lee' });
  });

  it('If gridEvent "stop" occurs in beforeChange, setValue does not occur.', () => {
    const stub = cy.stub();
    const beforeCallback = (ev: GridEvent) => {
      stub(ev);
      ev.stop();
    };
    const afterCallback = cy.stub();

    createGridWithCallback(beforeCallback, afterCallback);

    cy.gridInstance().invoke('startEditing', 0, 'name');
    cy.getByCls('content-text').type('Kim');
    cy.gridInstance().invoke('finishEditing', 0, 'name');

    cy.wrap(stub)
      .should('be.calledOnce')
      .and('calledWithMatch', { rowKey: 0, columnName: 'name', value: 'Lee', nextValue: 'Kim' });
    cy.wrap(afterCallback).should('be.not.called');
    cy.getCell(0, 'name').should('have.text', 'Lee');
  });
});

describe('custom editor', () => {
  ['editor', 'editor type'].forEach((option) => {
    it(`create custom editor by ${option} property`, () => {
      const stub = cy.stub();
      const CustomLayerEditor = createCustomLayerEditor(stub);

      const data = [
        { name: 'Lee', age: 20 },
        { name: 'Han', age: 28 },
        { name: 'Ryu', age: 22 },
      ];
      const columns = [
        {
          name: 'name',
          editor: option === 'editor' ? CustomLayerEditor : { type: CustomLayerEditor },
        },
        { name: 'age' },
      ];

      cy.createGrid({ data, columns });

      cy.gridInstance().invoke('startEditing', 0, 'name');

      cy.get('.custom-editor-layer').should('be.visible');

      cy.getCell(1, 'name').click();

      cy.get('.custom-editor-layer').should('be.not.visible');
      cy.wrap(stub).should('be.calledOnce');
    });
  });
});

describe('API', () => {
  const listForFinishEditingTest = [
    {
      type: 'finishEditing(rowKey, columnName, value)',
      params: [1, 'name', 'Choi'],
      editedValue: 'Kim',
      result: 'Choi',
    },
    {
      type: 'finishEditing(rowKey, columnName)',
      params: [1, 'name'],
      editedValue: 'Kim',
      result: 'Kim',
    },
    {
      type: 'finishEditing()',
      params: [],
      editedValue: 'Kim',
      result: 'Kim',
    },
  ];

  beforeEach(() => {
    const data = [
      { name: 'Lee', age: 20 },
      { name: 'Han', age: 28 },
      { name: 'Ryu', age: 22 },
    ];
    const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

    cy.createGrid({ data, columns });
  });

  ['startEditing', 'startEditingAt'].forEach((api) => {
    it(`${api}()`, () => {
      if (api === 'startEditing') {
        cy.gridInstance().invoke(api, 1, 'name');
      } else {
        cy.gridInstance().invoke(api, 1, 0);
      }

      cy.getByCls('content-text').should('be.visible');
    });
  });

  listForFinishEditingTest.forEach((obj) => {
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
      { name: 'Ryu', age: 22 },
      { name: 'Kim', age: 30, _attributes: { height: 0 } },
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

  it('cannot edit the cell which has `zero` height', () => {
    cy.gridInstance().invoke('startEditing', 3, 'age');

    cy.getByCls('layer-editing').should('be.not.visible');

    cy.gridInstance().invoke('finishEditing', 3, 'age', 11);

    cy.gridInstance().invoke('getValue', 3, 'age').should('eq', 30);
  });
});

it('should do synchronous rendering of the editing cell', () => {
  const stub = cy.stub();
  createGridWithEditingFinishEvent(stub);

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.getByCls('content-text').type('Kim');
  cy.gridInstance().invoke('finishEditing', 0, 'name');

  cy.getCell(0, 'name').should('have.text', 'Kim');

  cy.gridInstance().invoke('startEditing', 1, 'name');

  cy.getByCls('content-text').invoke('val').should('eq', 'Han');

  cy.wrap(stub)
    .should('be.calledOnce')
    .and('be.calledWithMatch', { rowKey: 0, columnName: 'name', value: 'Kim' });
});

['rowHeader', 'columnHeader'].forEach((type) => {
  it(`finish editing when ${type} is clicked`, () => {
    const stub = cy.stub();
    createGridWithEditingFinishEvent(stub);

    cy.gridInstance().invoke('startEditing', 1, 'name');

    if (type === 'columnHeader') {
      cy.getHeaderCell('name').as('targetCell');
    } else {
      cy.getRowHeaderCell(0, '_number').as('targetCell');
    }

    cy.get('@targetCell').click();

    cy.wrap(stub).should('be.calledOnce').and('calledWithMatch', { rowKey: 1, columnName: 'name' });
  });
});

describe('select, checkbox, radio editor', () => {
  const dataForGridWithType = [{ name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }];
  function createGridWithType(type: string) {
    const columns = [
      {
        name: 'name',
        formatter: 'listItemText',
        editor: {
          type,
          options: {
            listItems: [
              { text: 'A', value: '1' },
              { text: 'B', value: '2' },
              { text: 'C', value: '3' },
            ],
          },
        },
      },
      {
        name: 'isHuman',
        defaultValue: '2',
        formatter: 'listItemText',
        editor: {
          type,
          options: {
            listItems: [
              { text: 'true', value: '1' },
              { text: 'false', value: '2' },
            ],
          },
        },
      },
    ];

    cy.createGrid({ data: dataForGridWithType, columns });
  }

  context('UI', () => {
    ['radio', 'select', 'checkbox'].forEach((type) => {
      it(`initial value applied in ${type} editor`, () => {
        createGridWithType(type);

        cy.gridInstance().invoke('startEditing', 1, 'name');

        if (type === 'select') {
          cy.get('.tui-select-box-placeholder').should('have.text', 'B');
        } else {
          cy.getByCls(`editor-label-icon-${type}-checked`).should('have.text', 'B');
        }
      });

      it(`selected value is applied properly in the cell(${type})`, () => {
        createGridWithType(type);

        cy.gridInstance().invoke('startEditing', 1, 'name');

        if (type === 'select') {
          cy.get('.tui-select-box-item').eq(0).click();
          cy.getCellByIdx(0, 0).click();

          cy.getCellByIdx(1, 0).should('have.text', 'A');
        } else {
          cy.getByCls(`editor-label-icon-${type}`).eq(0).click();
          cy.getCellByIdx(0, 0).click();

          if (type === 'radio') {
            cy.getCellByIdx(1, 0).should('have.text', 'A');
          } else {
            cy.getCellByIdx(1, 0).should('have.text', 'A,B');
          }
        }
      });

      it(`should apply selected value properly when changing focus from left to right(${type})`, () => {
        createGridWithType(type);
        cy.gridInstance().invoke('setFrozenColumnCount', 1);
        cy.gridInstance().invoke('startEditing', 1, 'name');

        if (type === 'select') {
          cy.get('.tui-select-box-item').eq(0).click();
          cy.getCell(0, 'isHuman').click();

          cy.getCell(1, 'name').should('have.text', 'A');
        } else {
          cy.getByCls(`editor-label-icon-${type}`).eq(0).click();
          cy.getCell(0, 'isHuman').click();

          if (type === 'radio') {
            cy.getCell(1, 'name').should('have.text', 'A');
          } else {
            cy.getCell(1, 'name').should('have.text', 'A,B');
          }
        }
      });

      it(`should apply selected value properly when changing focus from right to left(${type})`, () => {
        createGridWithType(type);
        cy.gridInstance().invoke('setFrozenColumnCount', 1);
        cy.gridInstance().invoke('startEditing', 1, 'isHuman');

        if (type === 'select') {
          cy.get('.tui-select-box-item').eq(0).click();
          cy.getCell(0, 'name').click();

          cy.getCell(1, 'isHuman').should('have.text', 'true');
        } else {
          cy.getByCls(`editor-label-icon-${type}`).eq(0).click();
          cy.getCell(0, 'name').click();

          if (type === 'radio') {
            cy.getCell(1, 'isHuman').should('have.text', 'true');
          } else {
            cy.getCell(1, 'isHuman').should('have.text', 'true,false');
          }
        }
      });
    });

    it('should return a empty string when selecting a value that is not in the select box', () => {
      createGridWithType('select');

      cy.gridInstance().invoke('startEditing', 3, 'name');
      // finish editing by clicking the another cell
      cy.getCell(0, 'name').click();

      cy.getCell(3, 'name').should('have.text', '');
    });
  });

  // @TODO: There is a issue that the checkbox is unchecked when cypress type. Only the hover style is tested.
  context('hover style(radio)', () => {
    function press(key: string) {
      cy.getByCls('editor-checkbox-list-layer').type(key);
    }

    function assertOptionHighlighted(value: CellValue) {
      cy.getByCls('editor-checkbox-hovered').should('have.id', `checkbox-${value}`);
    }

    it('typing the arrow key changes the current option focus and hover style', () => {
      createGridWithType('radio');
      cy.gridInstance().invoke('startEditing', 1, 'name');
      assertOptionHighlighted(2);

      press('{downarrow}');
      assertOptionHighlighted(3);

      press('{uparrow}');
      assertOptionHighlighted(2);

      press('{leftarrow}');
      assertOptionHighlighted(1);

      press('{rightarrow}');
      assertOptionHighlighted(2);
    });

    it('hovering the mouse changes the current option focus and hover style', () => {
      createGridWithType('radio');
      cy.gridInstance().invoke('startEditing', 1, 'name');

      cy.getByCls('editor-checkbox').eq(2).trigger('mouseover');

      assertOptionHighlighted(3);
    });
  });

  describe('remove drop-down layer', () => {
    ['radio', 'select', 'checkbox'].forEach((type) => {
      it(`should remove drop-down layer when calling cancelEditing() API (${type})`, () => {
        createGridWithType(type);

        cy.gridInstance().invoke('cancelEditing');

        cy.getByCls('editor-select-box-layer').should('be.not.visible');
      });

      it(`should remove drop-down layer when calling resetData() API (${type})`, () => {
        createGridWithType(type);

        cy.gridInstance().invoke('resetData', dataForGridWithType);

        cy.getByCls('editor-select-box-layer').should('be.not.visible');
      });
    });
  });

  describe('Inatant apply', () => {
    function createGridWithTypeAndInstantApply(type: 'select' | 'radio' | 'checkbox') {
      const columns = [
        {
          name: 'name',
          formatter: 'listItemText',
          editor: {
            type,
            options: {
              listItems: [
                { text: 'A', value: '1' },
                { text: 'B', value: '2' },
                { text: 'C', value: '3' },
              ],
              instantApply: true,
            },
          },
        },
        {
          name: 'isHuman',
          defaultValue: '2',
          formatter: 'listItemText',
          editor: {
            type,
            options: {
              listItems: [
                { text: 'true', value: '1' },
                { text: 'false', value: '2' },
              ],
              instantApply: true,
            },
          },
        },
      ];

      cy.createGrid({ data: dataForGridWithType, columns });
    }

    it('should apply selected value instantly when instantApply option is true(select)', () => {
      createGridWithTypeAndInstantApply('select');
      cy.gridInstance().invoke('setFrozenColumnCount', 1);
      cy.gridInstance().invoke('startEditing', 1, 'isHuman');

      cy.get('.tui-select-box-item').eq(0).click();

      cy.getByCls('editor-select-box-layer').should('be.not.visible');
      cy.getCell(1, 'isHuman').should('have.text', 'true');
    });

    it('should apply selected value instantly when instantApply option is true(radio)', () => {
      createGridWithTypeAndInstantApply('radio');
      cy.gridInstance().invoke('setFrozenColumnCount', 1);
      cy.gridInstance().invoke('startEditing', 1, 'isHuman');

      cy.getByCls(`editor-label-icon-radio`).eq(0).click();

      cy.getByCls('editor-checkbox-list-layer').should('be.not.visible');
      cy.getCell(1, 'isHuman').should('have.text', 'true');
    });

    it('should not apply selected value instantly when instantApply option is true(checkbox)', () => {
      createGridWithTypeAndInstantApply('checkbox');
      cy.gridInstance().invoke('setFrozenColumnCount', 1);
      cy.gridInstance().invoke('startEditing', 1, 'isHuman');

      cy.getByCls(`editor-label-icon-checkbox`).eq(0).click();

      cy.getByCls('editor-checkbox-list-layer').should('be.visible');
    });
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

it('should not copy prev value as moving the editing cell by tab keyMap', () => {
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
    { name: 'Ryu', age: 22 },
  ];
  const columns = [
    { name: 'name', editor: 'text' },
    { name: 'age', editor: 'text' },
  ];

  cy.createGrid({ data, columns });

  cy.gridInstance().invoke('startEditing', 0, 'age');

  cy.getByCls('content-text').invoke('val').should('eq', '20');

  cy.getByCls('content-text').tab().tab({ shift: true });

  cy.getByCls('content-text').invoke('val').should('eq', 'Lee');
});

it('should destroy the editing cell as next cell is not editable cell on moving by tab keyMap', () => {
  const data = [
    { name: 'Lee', age: 20 },
    { name: 'Han', age: 28 },
    { name: 'Ryu', age: 22 },
  ];
  const columns = [{ name: 'name', editor: 'text' }, { name: 'age' }];

  cy.createGrid({ data, columns });

  cy.gridInstance().invoke('startEditing', 0, 'name');
  cy.getByCls('content-text').tab().tab();

  cy.getByCls('content-text').should('be.not.visible');
});

describe('editing event: click', () => {
  beforeEach(() => {
    createGridWithEditingEvent();
  });

  it('should render the editing layer when clicking the cell', () => {
    cy.getCell(0, 'name').click().trigger('click');

    cy.getByCls('content-text').should('be.visible');
  });

  it('shoud not copy the value to other cell when focus event is stoped', () => {
    cy.gridInstance().invoke('on', (ev: GridEventProps & GridEvent) => {
      if (ev.columnName === 'name') {
        ev.stop();
      }
    });

    cy.getCell(0, 'age').click().trigger('click');
    // click the cell which stops to change focus
    cy.getCell(0, 'name').click();
    cy.getCell(1, 'age').click().trigger('click');

    cy.getByCls('content-text').should('be.visible').and('have.value', '28');
  });

  ['API', 'UI'].forEach((type) => {
    it(`shoud not emit the error when clicking the cell which stops to change focus by ${type}`, () => {
      cy.gridInstance().invoke('on', (ev: GridEventProps & GridEvent) => {
        if (ev.columnName === 'name') {
          ev.stop();
        }
      });

      // click the cell which stops to change focus
      if (type === 'UI') {
        cy.getCell(0, 'name').click();
      } else {
        cy.gridInstance().invoke('startEditing', 0, 'name');
      }
      cy.getCell(1, 'age').click().trigger('click');

      cy.getByCls('content-text').should('be.visible').and('have.value', '28');
    });
  });
});

describe('original cell value should be kept', () => {
  beforeEach(() => {
    const data = [
      { name: null, age: 20 },
      // eslint-disable-next-line no-undefined
      { name: undefined, age: 28 },
    ];
    const columns = [{ name: 'name', editor: CustomTextEditor }, { name: 'age' }];

    cy.createGrid({ data, columns, editingEvent: 'click' });
  });

  it('original value - `null`', () => {
    cy.gridInstance().invoke('startEditing', 0, 'name');

    cy.get('input').should('have.value', 'null');
  });

  it('original value - `undefined`', () => {
    cy.gridInstance().invoke('startEditing', 1, 'name');

    cy.get('input').should('have.value', 'undefined');
  });
});

describe('Scroll with editor that has drop-down layer', () => {
  function scrollTo(position: Cypress.PositionType) {
    cy.getByCls('rside-area', 'body-area').wait(100).scrollTo(position);
  }

  const data = [
    { id: '1', name: 'Kim', age: '10', school: '1', grade: 'First' },
    { id: '2', name: 'Lee', age: '11', school: '1', grade: 'Second' },
    { id: '3', name: 'Park', age: '12', school: '1', grade: 'First' },
    { id: '4', name: 'Choi', age: '13', school: '1', grade: 'Second' },
    { id: '5', name: 'Cho', age: '14', school: '1', grade: 'Third' },
    { id: '6', name: 'Han', age: '14', school: '1', grade: 'Second' },
    { id: '7', name: 'Lim', age: '14', school: '1', grade: 'First' },
    { id: '8', name: 'Ahn', age: '14', school: '1', grade: 'Second' },
    { id: '9', name: 'Ryu', age: '14', school: '1', grade: 'First' },
  ];
  const columns = [
    { name: 'id', minWidth: 100 },
    { name: 'name', minWidth: 100 },
    {
      name: 'school',
      formatter: 'listItemText',
      editor: {
        type: 'select',
        options: {
          listItems: [
            { text: 'Primary', value: '1' },
            { text: 'Middle', value: '2' },
            { text: 'High', value: '3' },
          ],
        },
      },
      minWidth: 100,
    },
    { name: 'age', minWidth: 100 },
    { name: 'grade', minWidth: 100 },
  ];

  [
    { direcion: 'down', position: 'bottom' },
    { direcion: 'up', position: 'top' },
    { direcion: 'right', position: 'right' },
    { direcion: 'left', position: 'left' },
  ].forEach(({ direcion, position }) => {
    it(`should hides the drop-down layer when scrolling ${direcion}`, () => {
      cy.createGrid({ data, columns, width: 200, bodyHeight: 150 });
      cy.gridInstance().invoke('startEditing', 4, 'school');

      scrollTo(position as Cypress.PositionType);

      cy.getByCls('editor-select-box-layer').should('have.css', 'z-index', '-100');
    });
  });
});
