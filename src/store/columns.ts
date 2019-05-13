import { Column, ColumnInfo, Dictionary, DefaultRowHeaders } from './types';
import { OptColumn, OptColumnOptions, OptRowHeader } from '../types';
import { reactive } from '../helper/reactive';
import { createMapFromArray } from '../helper/common';

const DEF_MIN_WIDTH = 50;

const defaultRowHeaders: DefaultRowHeaders = {
  rowNum: {
    type: 'rowNum',
    title: 'No.',
    name: '_number',
    hidden: false,
    editor: false,
    viewer: false,
    fixedWidth: true,
    baseWidth: 40,
    minWidth: 40,
    resizable: false,
    align: 'center'
  }
};

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
  const align = column.align || 'left';

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
    resizable,
    align
  });
}

function getMetaColumnInfos(rowHeadersOption: OptRowHeader[]) {
  // @TODO select 'checkbox' or 'raido'
  return rowHeadersOption.map((data) => {
    let allData;

    if (typeof data === 'object') {
      allData = Object.assign({}, defaultRowHeaders[data.type], data);
    } else {
      allData = defaultRowHeaders[data];
    }

    // @TODO template...

    return allData;
  });
}

export function create(
  columns: OptColumn[],
  columnOptions: OptColumnOptions = {},
  rowHeaders: OptRowHeader[]
): Column {
  const columnInfos = columns.map((column) => {
    return createColumn(column, columnOptions);
  });
  const metaColumnInfos = getMetaColumnInfos(rowHeaders);
  const allColumns = metaColumnInfos.concat(columnInfos);

  return reactive({
    frozenCount: columnOptions.frozenCount || 0,
    allColumns,
    rowHeaders: metaColumnInfos,
    get allColumnMap() {
      return createMapFromArray(this.allColumns, 'name') as Dictionary<ColumnInfo>;
    },
    get visibleColumns() {
      return allColumns.filter(({ hidden }) => !hidden);
    },
    get visibleColumnsBySide() {
      const index = this.frozenCount + this.visibleMetaColumnCount;

      return {
        L: this.visibleColumns.slice(0, index),
        R: this.visibleColumns.slice(index)
      };
    },
    get visibleFrozenCount(this: Column) {
      return this.visibleColumnsBySide.L.length;
    },
    get visibleMetaColumnCount() {
      return metaColumnInfos.length;
    }
  });
}
