import { dataAttr } from '@/helper/dom';

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
  });
});

describe('getElement()', () => {
  it('should returns the HTMLElement of the given cell address', () => {
    const data = [{ c1: 10, c2: 20 }, { c1: 20, c2: 30 }];
    const columns = [{ name: 'c1' }, { name: 'c2' }];

    cy.createGrid({ data, columns });

    cy.gridInstance()
      .invoke('getElement', 0, 'c1')
      .should('have.attr', dataAttr.ROW_KEY, '0')
      .and('have.attr', dataAttr.COLUMN_NAME, 'c1');

    cy.gridInstance()
      .invoke('getElement', 1, 'c2')
      .should('have.attr', dataAttr.ROW_KEY, '1')
      .and('have.attr', dataAttr.COLUMN_NAME, 'c2');
  });
});
