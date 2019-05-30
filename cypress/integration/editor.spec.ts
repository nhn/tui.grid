import { isSubsetOf } from '../helper/compare';
import { cls } from '@/helper/dom';
import GridEvent from '@/event/gridEvent';

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
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
      expect(isSubsetOf({ rowKey: 0, columnName: 'name', value: 'Kim' }, beforeCallback.args[0][0]))
        .to.be.true;
      expect(isSubsetOf({ rowKey: 0, columnName: 'name', value: 'Kim' }, afterCallback.args[0][0]))
        .to.be.true;
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
