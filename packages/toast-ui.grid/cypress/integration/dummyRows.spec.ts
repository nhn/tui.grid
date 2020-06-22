before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  const columns = [{ name: 'id', editor: 'text' }, { name: 'name' }];
  const data = [
    { id: 1, name: 'Kim', score: 90, grade: 'A' },
    { id: 2, name: 'Lee', score: 80, grade: 'B' }
  ];
  cy.createGrid({ data, columns, bodyHeight: 400, showDummyRows: true });
});

it('should render dummy rows', () => {
  cy.getByCls('cell-dummy').should('exist');
});

it('should inialize focus and selection layer', () => {
  cy.gridInstance().invoke('focusAt', 0, 0);
  cy.gridInstance().invoke('setSelectionRange', { start: [0, 0], end: [0, 0] });

  cy.getByCls('cell-dummy')
    .first()
    .click();

  cy.getByCls('layer-focus').should('not.exist');
  cy.getByCls('layer-selection').should('not.visible');
});

it('should save the editing result when clicking the dummy cell', () => {
  cy.gridInstance().invoke('startEditing', 0, 'id');
  cy.getByCls('content-text').type('test');

  cy.getByCls('cell-dummy')
    .first()
    .click();

  cy.getCell(0, 'id').should('have.text', 'test');
});
