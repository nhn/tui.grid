import { Column, ColumnInfo, Dictionary, DefaultRowHeaders } from './types';
import { OptColumn, OptColumnOptions, OptRowHeader } from '../types';
import { reactive } from '../helper/reactive';
import { createMapFromArray } from '../helper/common';
import { DefaultRenderer } from '../renderer/default';

const DEF_MIN_WIDTH = 50;

const defaultRowHeaders: DefaultRowHeaders = {
  rowNum: {
    type: 'rowNum',
    title: 'No.',
    name: '_number',
    hidden: false,
    editor: false,
    renderer: DefaultRenderer,
    fixedWidth: true,
    baseWidth: 40,
    minWidth: 40,
    resizable: false,
    align: 'center'
  }
};

// eslint-disable-next-line complexity
function createColumn(column: OptColumn, columnOptions: OptColumnOptions): ColumnInfo {
  const {
    title,
    name,
    width,
    minWidth,
    editor,
    align,
    hidden,
    resizable,
    renderer,
    rendererOptions
  } = column;
  const fixedWidth = typeof width === 'number';
  const baseWidth = (width === 'auto' ? 0 : width) || 0;

  return reactive({
    name,
    title: title || name,
    hidden: Boolean(hidden),
    resizable: Boolean(resizable),
    align: align || 'left',
    editor: typeof editor === 'string' ? { type: editor } : editor,
    renderer: renderer || DefaultRenderer,
    rendererOptions,
    fixedWidth,
    baseWidth,
    // @TODO meta tag 체크 여부
    minWidth: minWidth || columnOptions.minWidth || DEF_MIN_WIDTH
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
