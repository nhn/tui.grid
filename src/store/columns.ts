import { Column, ColumnInfo } from './types';
import { OptColumn, OptColumnOptions } from '../types';
import { reactive } from '../helper/reactive';

const DEF_MIN_WIDTH = 50;

function createColumn(column: OptColumn, columnOptions: OptColumnOptions): ColumnInfo {
  const title = column.title || column.name;
  const name = column.name;
  const hidden = !!column.hidden;
  const fixedWidth = typeof column.width === 'number';
  const baseWidth = (column.width === 'auto' ? 0 : column.width) || 0;
  const resizable = !!column.resizable;

  // @TODO meta tag 체크 여부
  const minWidth = column.minWidth || columnOptions.minWidth || DEF_MIN_WIDTH;

  return reactive({
    title,
    name,
    hidden,
    fixedWidth,
    baseWidth,
    minWidth,
    resizable
  });
}

export function create(columns: OptColumn[], columnOptions: OptColumnOptions = {}): Column {
  const columnInfos = columns.map((column) => {
    return createColumn(column, columnOptions);
  });

  return reactive({
    frozenCount: columnOptions.frozenCount || 0,
    rowHeaders: [],
    allColumns: columnInfos,
    get visibleColumns() {
      return {
        L: columnInfos.slice(0, this.frozenCount).filter(({ hidden }) => !hidden),
        R: columnInfos.slice(this.frozenCount).filter(({ hidden }) => !hidden)
      };
    },
    get visibleFrozenCount(this: Column) {
      return this.visibleColumns.L.length;
    }
  });
}
