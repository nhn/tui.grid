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
  return rowHeadersOption
    .map((data) => (typeof data === 'string' ? { name: data } : data))
    .map(
      (metaColumn: OptColumn): ColumnInfo => {
        const { name, width, minWidth } = metaColumn;
        const isRowNum = name === '_number';
        const baseMinWidth = typeof minWidth === 'number' ? minWidth : DEF_META_COLUMN_MIN_WIDTH;
        const baseWidth = (width === 'auto' ? baseMinWidth : width) || baseMinWidth;

        return reactive(
          Object.assign(
            {
              title: isRowNum ? 'No.' : '',
              name,
              renderer: isRowNum ? DefaultRenderer : MetaColumnInputRenderer,
              rendererOptions: { inputType: 'checkbox' },
              baseWidth,
              minWidth: baseMinWidth,
              hidden: false,
              fixedWidth: true,
              resizable: false,
              align: 'center'
            },
            metaColumn
          )
        );
      }
    );
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
