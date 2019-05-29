import { cls } from '@/helper/dom';
import GridEvent from '@/event/gridEvent';

const data = [{ name: 'Kim', age: 10 }, { name: 'Lee', age: 20 }];
const columns = [{ name: 'name' }, { name: 'age' }];

describe('mouse', () => {
  before(() => {
    cy.visit('/dist');
    cy.document().then((doc) => {
      doc.body.innerHTML = '';
    });

    cy.createGrid({
      data,
      columns,
      rowHeaders: ['_number', '_checked']
    });
  });

  it('click', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'click', callback);

    cy.get(`.${cls('container')}`)
      .click()
      .then(() => {
        expect(callback).to.be.called;
      });

    cy.gridInstance().invoke('off', 'click');
  });

  it('mouseover', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'mouseover', callback);

    cy.get(`.${cls('container')}`)
      .trigger('mouseover')
      .then(() => {
        expect(callback).to.be.called;
      });

    cy.gridInstance().invoke('off', 'mouseover');
  });

  it('mousedown', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'mousedown', callback);

    cy.get(`.${cls('container')}`)
      .trigger('mousedown')
      .then(() => {
        expect(callback).to.be.called;
      });

    cy.gridInstance().invoke('off', 'mousedown');
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

    cy.gridInstance().invoke('off', 'mousedown');
  });

  it('mouseout', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'mouseout', callback);

    cy.get(`.${cls('container')}`)
      .trigger('mouseout')
      .then(() => {
        expect(callback).to.be.called;
      });

    cy.gridInstance().invoke('off', 'mouseout');
  });

  it('dblClick', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'dblClick', callback);

    cy.get(`.${cls('container')}`)
      .dblclick()
      .then(() => {
        expect(callback).to.be.called;
      });

    cy.gridInstance().invoke('off', 'dblClick');
  });
});

describe('focus / selection', () => {
  it('focus change', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'focusChange', callback);

    cy.getCell(0, 'name')
      .click()
      .then(() => {
        expect(callback).to.be.called;
      });
    cy.getCell(1, 'age')
      .click()
      .then(() => {
        expect(callback).to.be.calledTwice;
      });

    cy.gridInstance().invoke('off', 'focusChange');
  });

  it('focus change by api', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'focusChange', callback);

    cy.gridInstance()
      .invoke('focus', 0, 'name')
      .then(() => {
        expect(callback).to.be.called;
      });

    cy.gridInstance()
      .invoke('blur')
      .then(() => {
        expect(callback).to.be.calledTwice;
      });

    cy.gridInstance().invoke('off', 'focusChange');
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

    cy.gridInstance().invoke('off', 'focusChange');
  });

  it('selection by api', () => {
    // keyboard, mouse event untestable
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'selection', callback);

    cy.gridInstance()
      .invoke('selection', { start: [0, 0], end: [1, 1] })
      .then(() => {
        expect(callback).to.be.called;
      });

    cy.gridInstance().invoke('off', 'selection');
  });
});

describe('check / uncheck', () => {
  before(() => {
    cy.document().then((doc) => {
      doc.body.innerHTML = '';
    });

    cy.createGrid({
      data,
      columns,
      rowHeaders: ['_number', '_checked']
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
        expect(checkCallback).to.be.called;
      })
      .click()
      .then(() => {
        expect(uncheckCallback).to.be.called;
      });

    cy.gridInstance().invoke('off', 'check');
    cy.gridInstance().invoke('off', 'uncheck');
  });
});
