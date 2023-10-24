import { RowKey } from '@t/store/data';

type Address = [number, number];

export function clipboardType(key: string) {
  cy.getByCls('clipboard').type(key, { force: true });
}

export function editingLayerType(key: string) {
  cy.getByCls('layer-editing').type(key);
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

export function setSelectionUsingMouse(start: Address, end: Address) {
  cy.getCellByIdx(start[0], start[1]).trigger('mousedown');
  cy.getCellByIdx(end[0], end[1])
    .invoke('offset')
    .then(({ left, top }) => {
      cy.get('body')
        .trigger('mousemove', { pageX: left + 10, pageY: top + 10 })
        .trigger('mouseup');
    });
}

export function dragAndDropRow(rowKey: RowKey, position: number) {
  cy.getCell(rowKey, '_draggable')
    .trigger('mousedown')
    .trigger('mousemove', { pageY: position, force: true })
    .trigger('mouseup', { force: true });
}

export function dragAndDropColumn(columnName: string, position: number) {
  cy.getHeaderCell(columnName)
    .trigger('mousedown')
    .trigger('mousemove', { pageY: 200, force: true })
    .trigger('mousemove', { pageX: position, force: true })
    .trigger('mouseup', { force: true });
}
