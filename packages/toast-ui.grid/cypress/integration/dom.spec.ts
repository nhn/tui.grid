import { dataAttr, cls } from '@/helper/dom';

before(() => {
  cy.visit('/dist');
});

function createGridInHiddenParent(parentWidth: number, parentHeight: number, gridOptions: any) {
  const parentEl = document.createElement('div');

  parentEl.id = 'parent';
  parentEl.style.width = `${parentWidth}px`;
  parentEl.style.height = `${parentHeight}px`;

  cy.createGrid({ ...gridOptions }, {}, parentEl);
}

describe('getElement()', () => {
  it('should returns the HTMLElement of the given cell address', () => {
    const data = [
      { c1: 10, c2: 20 },
      { c1: 20, c2: 30 },
    ];
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

describe('refreshLayout()', () => {
  it('should re-calculate width and height', () => {
    const data = [
      { c1: 10, c2: 20 },
      { c1: 20, c2: 30 },
    ];
    const columns = [{ name: 'c1' }, { name: 'c2' }];
    const bodyHeight = 'fitToParent';

    createGridInHiddenParent(817, 600, { data, columns, bodyHeight });

    cy.gridInstance().invoke('refreshLayout');

    cy.getByCls('container').invoke('width').should('to.eq', 817);

    cy.getByCls('rside-area').invoke('width').should('eq', 817);

    cy.getByCls('rside-area').within(($el) => {
      const headerAreaHeight = $el.find(`.${cls('header-area')}`).height()!;
      const bodyAreaHeight = $el.find(`.${cls('body-area')}`).height()!;

      expect($el.width()).to.eq(817);
      expect(headerAreaHeight + bodyAreaHeight).to.eq(599);
    });

    cy.getCell(0, 'c1').invoke('width').should('to.eq', 400);

    cy.getCell(0, 'c2').invoke('width').should('to.eq', 400);
  });
});
