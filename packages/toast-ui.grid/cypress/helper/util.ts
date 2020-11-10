export function clipboardType(key: string) {
  cy.getByCls('clipboard').type(key, { force: true });
}

export function moveToNextPage() {
  cy.get('.tui-page-btn.tui-next').click({ force: true });
}

export function applyAliasHeaderCheckbox() {
  cy.getByCls('cell-row-header').get('input').eq(0).as('checkbox');
}

export function invokeFilter(columnName: string, states: any) {
  cy.gridInstance().invoke('filter', columnName, states);
}

export function clickFilterBtn() {
  cy.getByCls('btn-filter').click();
}

export function inputFilterValue(value: string) {
  cy.getByCls('filter-container', 'filter-input').type(value);
}
