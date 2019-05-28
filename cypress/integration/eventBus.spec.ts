import { cls } from '@/helper/dom';

const data = [{ name: 'Kim', age: 10 }, { name: 'Lee', age: 20 }];
const columns = [{ name: 'name' }, { name: 'age' }];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });

  cy.createGrid({
    data,
    columns
    // rowHeaders: ['_number', '_checked'],
    // showDummyRows: true,
    // bodyHeight: 400
  });
});

describe('click / mouseover / mousedown / mouseout / dblClick', () => {
  it('click', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'click', callback);

    cy.get(`.${cls('container')}`)
      .click()
      .then(() => {
        expect(callback).to.be.called;
      });
  });

  it('mouseover', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'mouseover', callback);

    cy.get(`.${cls('container')}`)
      .trigger('mouseover')
      .then(() => {
        expect(callback).to.be.called;
      });
  });

  it('mousedown', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'mousedown', callback);

    cy.get(`.${cls('container')}`)
      .trigger('mousedown')
      .then(() => {
        expect(callback).to.be.called;
      });
  });

  it('mouseout', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'mouseout', callback);

    cy.get(`.${cls('container')}`)
      .trigger('mouseout')
      .then(() => {
        expect(callback).to.be.called;
      });
  });

  it('dblClick', () => {
    const callback = cy.stub();
    cy.gridInstance().invoke('on', 'dblClick', callback);

    cy.get(`.${cls('container')}`)
      .dblclick()
      .then(() => {
        expect(callback).to.be.called;
      });
  });
});
