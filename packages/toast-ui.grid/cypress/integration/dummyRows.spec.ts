import { cls } from '@/helper/dom';

before(() => {
  cy.visit('/dist');
});

describe('basic case', () => {
  beforeEach(() => {
    const columns = [{ name: 'id', editor: 'text' }, { name: 'name' }];
    const data = [
      { id: 1, name: 'Kim', score: 90, grade: 'A' },
      { id: 2, name: 'Lee', score: 80, grade: 'B' },
    ];
    cy.createGrid({ data, columns, bodyHeight: 400, showDummyRows: true });
  });

  it('should render dummy rows', () => {
    cy.getByCls('cell-dummy').should('exist');
  });

  it('should initialize focus and selection layer', () => {
    cy.gridInstance().invoke('focusAt', 0, 0);
    cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [0, 0] });

    cy.getByCls('cell-dummy').first().click();

    cy.getByCls('layer-focus').should('not.exist');
    cy.getByCls('layer-selection').should('not.visible');
  });

  it('should save the editing result when clicking the dummy cell', () => {
    cy.gridInstance().invoke('startEditing', 0, 'id');
    cy.getByCls('content-text').type('test');

    cy.getByCls('cell-dummy').first().click();

    cy.getCell(0, 'id').should('have.text', 'test');
  });
});

describe('The grid with filters', () => {
  beforeEach(() => {
    const columns = [
      { name: 'name', minWidth: 200, filter: 'text' },
      { name: 'artist', minWidth: 200 },
      { name: 'type', minWidth: 200 },
      { name: 'price', minWidth: 200 },
      { name: 'release', minWidth: 200 },
      { name: 'genre', minWidth: 200 },
    ];
    const data = [
      { name: 'Beautiful Lies', artist: 'Birdy' },
      { name: 'X', artist: 'Ed Sheeran' },
    ];
    cy.createGrid({ data, columns, bodyHeight: 400, showDummyRows: true });
  });

  it('should show dummy cells when scrollX is located at the farthest right', () => {
    cy.gridInstance().invoke('filter', 'name', [{ code: 'eq', value: 'text' }]);
    cy.getRsideBody()
      .scrollTo('right')
      .should(($el) => {
        setTimeout(() => {
          const leftPos = $el.find(`.${cls('table-container')}`).css('left');

          expect(leftPos).eq('200px');
        });
      });
  });
});
