import { Column } from './types';
import { OptColumn, OptColumnOptions } from '../types';

const DEF_MIN_WIDTH = 50;

function createColumn(column: OptColumn, columnOptions: OptColumnOptions): Column {
  const title = column.title || column.name;
  const name = column.name;
  const fixedWidth = typeof column.width === 'number';
  const baseWidth = (column.width === 'auto' ? 0 : column.width) || 0;

  // @TODO meta tag 체크 여부
  const minWidth = column.minWidth || columnOptions.minWidth || DEF_MIN_WIDTH;

  return {
    title,
    name,
    fixedWidth,
    baseWidth,
    minWidth
  };
}

export function create(columns: OptColumn[], columnOptions: OptColumnOptions): Column[] {
  return columns.map((column) => {
    return createColumn(column, columnOptions || {});
  });
}
