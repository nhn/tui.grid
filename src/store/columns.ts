import { Column, ColumnInfo } from './types';
import { OptColumn, OptColumnOptions } from '../types';
import { reactive } from '../helper/reactive';

const DEF_MIN_WIDTH = 50;

// eslint-disable-next-line complexity
function createColumn(column: OptColumn, columnOptions: OptColumnOptions): ColumnInfo {
  const title = column.title || column.name;
  const { name, width } = column;
  const fixedWidth = typeof width === 'number';
  const baseWidth = (width === 'auto' ? 0 : width) || 0;
  const hidden = !!column.hidden;
  const resizable = !!column.resizable;
  const editor = typeof column.editor === 'string' ? { type: column.editor } : column.editor;
  const viewer = column.viewer === false ? '' : 'default';

  // @TODO meta tag 체크 여부
  const minWidth = column.minWidth || columnOptions.minWidth || DEF_MIN_WIDTH;

  return reactive({
    title,
    name,
    hidden,
    editor,
    viewer,
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
      return columnInfos.filter(({ hidden }) => !hidden);
    },
    get visibleColumnsBySide() {
      return {
        L: this.visibleColumns.slice(0, this.frozenCount),
        R: this.visibleColumns.slice(this.frozenCount)
      };
    },
    get visibleFrozenCount(this: Column) {
      return this.visibleColumnsBySide.L.length;
    }
  });
}
