export function isRowHeader(columnName: string) {
  return ['_number', '_checked'].indexOf(columnName) > -1;
}

export function isRowNumColumn(columnName: string) {
  return columnName === '_number';
}

export function isCheckboxColumn(columnName: string) {
  return columnName === '_checked';
}
