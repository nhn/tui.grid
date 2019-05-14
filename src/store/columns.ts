import { Column, ColumnInfo, Dictionary } from './types';
import { OptColumn, OptColumnOptions, OptRowHeader } from '../types';
import { reactive } from '../helper/reactive';
import { createMapFromArray } from '../helper/common';
import { DefaultRenderer } from '../renderer/default';
import { editorMap } from '../editor/manager';
import { CellEditorClass } from '../editor/types';
import { MetaColumnInputRenderer } from '../renderer/metaColumnInput';

const DEF_MIN_WIDTH = 50;
const DEF_META_COLUMN_MIN_WIDTH = 40;

function getEditorInfo(editor?: string | CellEditorClass, editorOptions?: Dictionary<any>) {
  if (typeof editor === 'string') {
    const editInfo = editorMap[editor];
    return {
      editor: editInfo[0],
      editorOptions: { ...editInfo[1], ...editorOptions }
    };
  }
  return { editor, editorOptions };
}

// eslint-disable-next-line complexity
function createColumn(column: OptColumn, columnOptions: OptColumnOptions): ColumnInfo {
  const {
    title,
    name,
    width,
    minWidth,
    align,
    hidden,
    resizable,
    editor,
    editorOptions,
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
    renderer: renderer || DefaultRenderer,
    rendererOptions,
    fixedWidth,
    baseWidth,
    minWidth: minWidth || columnOptions.minWidth || DEF_MIN_WIDTH, // @TODO meta tag 체크 여부
    ...getEditorInfo(editor, editorOptions)
  });
}

function getMetaColumnInfos(rowHeadersOption: OptRowHeader[]) {
  return rowHeadersOption.map(
    // eslint-disable-next-line complexity
    (data: OptRowHeader): ColumnInfo => {
      const metaColumn = typeof data === 'string' ? { name: data } : data;
      const { name, title, align, renderer, rendererOptions, width, minWidth } = metaColumn;
      const isRowNum = name === '_number';
      const baseMinWith = typeof minWidth === 'number' ? minWidth : DEF_META_COLUMN_MIN_WIDTH;
      const baseWidth = (width === 'auto' ? baseMinWith : width) || baseMinWith;

      return reactive({
        name,
        title: title || (isRowNum ? 'No.' : ''),
        hidden: false,
        resizable: false,
        align: align || 'center',
        renderer: renderer || (isRowNum ? DefaultRenderer : MetaColumnInputRenderer),
        rendererOptions: rendererOptions || { inputType: 'checkbox' },
        fixedWidth: true,
        baseWidth,
        minWidth: baseMinWith
      });
    }
  );
}

export function create(
  columns: OptColumn[],
  columnOptions: OptColumnOptions = {},
  rowHeadersOption: OptRowHeader[]
): Column {
  const columnInfos = columns.map((column) => createColumn(column, columnOptions));
  const metaColumnInfos = getMetaColumnInfos(rowHeadersOption);
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
      const frozenLastIndex = this.frozenCount + this.visibleMetaColumnCount;

      return {
        L: this.visibleColumns.slice(0, frozenLastIndex),
        R: this.visibleColumns.slice(frozenLastIndex)
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
