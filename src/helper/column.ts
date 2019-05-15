export function isRowHeader(columnName: string) {
  return ['_number', '_checked'].indexOf(columnName) > -1;
}
