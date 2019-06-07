import { Column, ColumnInfo, Dictionary, Relations, ClipboardCopyOptions } from './types';
import { OptColumn, OptColumnOptions, OptRowHeader, OptTree } from '../types';
import { observable } from '../helper/observable';
import { createMapFromArray, includes } from '../helper/common';
import { DefaultRenderer } from '../renderer/default';
import { editorMap } from '../editor/manager';
import { CellEditorClass } from '../editor/types';
import { RowHeaderInputRenderer } from '../renderer/rowHeaderInput';

const defMinWidth = {
  ROW_HEADER: 40,
  COLUMN: 50
};

const DEF_ROW_HEADER_INPUT = '<input type="checkbox" name="_checked" />';

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

function getTreeInfo(treeColumnOptions: OptTree, name: string) {
  if (treeColumnOptions && treeColumnOptions.name === name) {
    const { useIcon = true } = treeColumnOptions;

    return { tree: { useIcon } };
  }

  return null;
}

function getRelationMap(relations: Relations[]) {
  const relationMap: Dictionary<Relations> = {};
  relations.forEach((relation) => {
    const { editable, disabled, listItems, targetNames = [] } = relation;
    targetNames.forEach((targetName) => {
      relationMap[targetName] = {
        editable,
        disabled,
        listItems
      };
    });
  });

  return relationMap;
}

function getRelationColumns(relations: Relations[]) {
  const relationColumns: string[] = [];
  relations.forEach((relation) => {
    const { targetNames = [] } = relation;
    targetNames.forEach((targetName) => {
      relationColumns.push(targetName);
    });
  });

  return relationColumns;
}

export function createColumn(
  column: OptColumn,
  columnOptions: OptColumnOptions,
  relationColumns: string[],
  gridCopyOptions: ClipboardCopyOptions,
  treeColumnOptions: OptTree
): ColumnInfo {
  const {
    name,
    header,
    width,
    minWidth,
    align,
    hidden,
    resizable,
    editor,
    editorOptions,
    renderer,
    relations,
    sortable,
    copyOptions,
    validation
  } = column;

  return observable({
    ...column,
    escapeHTML: !!column.escapeHTML,
    header: header || name,
    hidden: Boolean(hidden),
    resizable: Boolean(resizable),
    align: align || 'left',
    renderer: renderer || DefaultRenderer,
    fixedWidth: typeof width === 'number',
    copyOptions: { ...gridCopyOptions, ...copyOptions },
    baseWidth: (width === 'auto' ? 0 : width) || 0,
    minWidth: minWidth || columnOptions.minWidth || defMinWidth.COLUMN, // @TODO meta tag 체크 여부
    relationMap: getRelationMap(relations || []),
    related: includes(relationColumns, name),
    sortable,
    ...getEditorInfo(editor, editorOptions),
    validation: validation ? { ...validation } : {},
    ...getTreeInfo(treeColumnOptions, name)
  });
}

function createRowHeader(data: OptRowHeader): ColumnInfo {
  const rowHeader = typeof data === 'string' ? { name: data } : data;
  const { name, header, align, renderer, rendererOptions, width, minWidth } = rowHeader;

  const baseRendererOptions = rendererOptions || { inputType: 'checkbox' };
  const baseMinWith = typeof minWidth === 'number' ? minWidth : defMinWidth.ROW_HEADER;
  const baseWidth = (width === 'auto' ? baseMinWith : width) || baseMinWith;

  const isRowNum = name === '_number';

  let defaultHeader = '';

  if (isRowNum) {
    defaultHeader = 'No.';
  } else if (baseRendererOptions.inputType === 'checkbox') {
    defaultHeader = DEF_ROW_HEADER_INPUT;
  }

  return observable({
    name,
    header: header || defaultHeader,
    hidden: false,
    resizable: false,
    align: align || 'center',
    renderer: renderer || (isRowNum ? DefaultRenderer : RowHeaderInputRenderer),
    rendererOptions: baseRendererOptions,
    fixedWidth: true,
    baseWidth,
    escapeHTML: false,
    minWidth: baseMinWith
  });
}

interface ColumnOptions {
  columns: OptColumn[];
  columnOptions: OptColumnOptions;
  rowHeaders: OptRowHeader[];
  copyOptions: ClipboardCopyOptions;
  keyColumnName?: string;
  treeColumnOptions: OptTree;
}

export function create({
  columns,
  columnOptions,
  rowHeaders,
  copyOptions,
  keyColumnName,
  treeColumnOptions
}: ColumnOptions): Column {
  const relationColumns = columns.reduce((acc: string[], { relations }) => {
    acc = acc.concat(getRelationColumns(relations || []));
    return acc.filter((columnName, idx) => acc.indexOf(columnName) === idx);
  }, []);
  const rowHeaderInfos = rowHeaders.map((rowHeader) => createRowHeader(rowHeader));
  const columnInfos = columns.map((column) =>
    createColumn(column, columnOptions, relationColumns, copyOptions, treeColumnOptions)
  );
  const allColumns = rowHeaderInfos.concat(columnInfos);
  const {
    name: treeColumnName,
    useIcon: treeIcon = true,
    useCascadingCheckbox: treeCascadingCheckbox = true
  } = treeColumnOptions;

  return observable({
    keyColumnName,

    frozenCount: columnOptions.frozenCount || 0,

    dataForColumnCreation: {
      copyOptions,
      columnOptions,
      treeColumnOptions,
      relationColumns,
      rowHeaders: rowHeaderInfos
    },

    allColumns,

    get allColumnMap() {
      return createMapFromArray(this.allColumns, 'name') as Dictionary<ColumnInfo>;
    },

    get rowHeaderCount() {
      return rowHeaderInfos.length;
    },

    get visibleColumns() {
      return this.allColumns.filter(({ hidden }) => !hidden);
    },

    get visibleColumnsBySide() {
      const frozenLastIndex = this.frozenCount + this.rowHeaderCount;

      return {
        L: this.visibleColumns.slice(0, frozenLastIndex),
        R: this.visibleColumns.slice(frozenLastIndex)
      };
    },

    get defaultValues() {
      return this.allColumns
        .filter(({ defaultValue }) => Boolean(defaultValue))
        .map(({ name, defaultValue }) => ({ name, value: defaultValue }));
    },

    get visibleFrozenCount(this: Column) {
      return this.visibleColumnsBySide.L.length;
    },

    get validationColumns() {
      return this.allColumns.filter(({ validation }) => !!validation);
    },

    get ignoredColumns() {
      return this.allColumns.filter(({ ignored }) => ignored).map(({ name }) => name);
    },

    ...(treeColumnName && { treeColumnName, treeIcon, treeCascadingCheckbox })
  });
}
