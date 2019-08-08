import {
  Column,
  ColumnInfo,
  Dictionary,
  Relations,
  ClipboardCopyOptions,
  ComplexColumnInfo,
  CellEditorOptions,
  CellRendererOptions,
  HeaderAlignInfo
} from './types';
import {
  OptColumn,
  OptColumnOptions,
  OptRowHeader,
  OptTree,
  OptCellEditor,
  OptCellRenderer,
  AlignType,
  VAlignType,
  ColumnsAlignInfo
} from '../types';
import { observable } from '../helper/observable';
import { isRowNumColumn } from '../helper/column';
import {
  createMapFromArray,
  includes,
  omit,
  isString,
  isFunction,
  isObject,
  isUndefined,
  isNumber,
  findProp
} from '../helper/common';
import { DefaultRenderer } from '../renderer/default';
import { editorMap } from '../editor/manager';
import { RowHeaderInputRenderer } from '../renderer/rowHeaderInput';

const ROW_HEADERS_MAP = {
  rowNum: '_number',
  checkbox: '_checked'
};
const defMinWidth = {
  ROW_HEADER: 40,
  COLUMN: 50
};
const DEF_ROW_HEADER_INPUT = '<input type="checkbox" name="_checked" />';

function getBuiltInEditorOptions(editorType: string, options?: Dictionary<any>) {
  const editInfo = editorMap[editorType];

  return {
    type: editInfo[0],
    options: {
      ...editInfo[1],
      ...options
    }
  };
}

function getEditorOptions(editor?: OptCellEditor): CellEditorOptions | null {
  if (isFunction(editor)) {
    return { type: editor };
  }
  if (isString(editor)) {
    return getBuiltInEditorOptions(editor);
  }
  if (isObject(editor)) {
    return isString(editor.type)
      ? getBuiltInEditorOptions(editor.type, editor.options)
      : (editor as CellEditorOptions);
  }
  return null;
}

function getRendererOptions(renderer?: OptCellRenderer): CellRendererOptions {
  if (isObject(renderer) && !isFunction(renderer) && isFunction(renderer.type)) {
    return renderer as CellRendererOptions;
  }
  return { type: DefaultRenderer };
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
  relations.forEach(relation => {
    const { editable, disabled, listItems, targetNames = [] } = relation;
    targetNames.forEach(targetName => {
      relationMap[targetName] = {
        editable,
        disabled,
        listItems
      };
    });
  });

  return relationMap;
}

export function getRelationColumns(relations: Relations[]) {
  const relationColumns: string[] = [];
  relations.forEach(relation => {
    const { targetNames = [] } = relation;
    targetNames.forEach(targetName => {
      relationColumns.push(targetName);
    });
  });

  return relationColumns;
}

function getHeaderAlignInfo(name: string, alignInfo: HeaderAlignInfo) {
  const { columnsAlign, align: defaultAlign, valign: defaultVAlign } = alignInfo;
  const columnOption = findProp('name', name, columnsAlign);
  const headerAlign = columnOption ? columnOption.align! : defaultAlign;
  const headerVAlign = columnOption ? columnOption.valign! : defaultVAlign;

  return {
    headerAlign,
    headerVAlign
  };
}

// eslint-disable-next-line max-params
export function createColumn(
  column: OptColumn,
  columnOptions: OptColumnOptions,
  relationColumns: string[],
  gridCopyOptions: ClipboardCopyOptions,
  treeColumnOptions: OptTree,
  alignInfo: HeaderAlignInfo
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
    renderer,
    relations,
    sortable,
    sortingType,
    copyOptions,
    validation,
    formatter,
    onBeforeChange,
    onAfterChange,
    whiteSpace,
    ellipsis,
    valign,
    defaultValue,
    escapeHTML,
    ignored
  } = column;

  const editorOptions = getEditorOptions(editor);
  const rendererOptions = getRendererOptions(renderer);
  const { headerAlign, headerVAlign } = getHeaderAlignInfo(name, alignInfo);

  return observable({
    name,
    escapeHTML,
    header: header || name,
    hidden: Boolean(hidden),
    resizable: isUndefined(resizable) ? Boolean(columnOptions.resizable) : Boolean(resizable),
    align: align || 'left',
    fixedWidth: typeof width === 'number',
    copyOptions: { ...gridCopyOptions, ...copyOptions },
    baseWidth: (width === 'auto' ? 0 : width) || 0,
    minWidth: minWidth || columnOptions.minWidth || defMinWidth.COLUMN, // @TODO meta tag 체크 여부
    relationMap: getRelationMap(relations || []),
    related: includes(relationColumns, name),
    sortable,
    sortingType: sortingType || 'asc',
    validation: validation ? { ...validation } : {},
    renderer: rendererOptions,
    formatter,
    onBeforeChange,
    onAfterChange,
    whiteSpace,
    ellipsis,
    valign,
    defaultValue,
    ignored,
    ...(!!editorOptions && { editor: editorOptions }),
    ...getTreeInfo(treeColumnOptions, name),
    headerAlign,
    headerVAlign
  });
}

function createRowHeader(data: OptRowHeader, alignInfo: HeaderAlignInfo): ColumnInfo {
  const rowHeader: OptColumn = isString(data)
    ? { name: ROW_HEADERS_MAP[data] }
    : { name: ROW_HEADERS_MAP[data.type], ...omit(data, 'type') };
  const { name, header, align, renderer, width, minWidth } = rowHeader;
  const baseMinWith = isNumber(minWidth) ? minWidth : defMinWidth.ROW_HEADER;
  const baseWidth = (width === 'auto' ? baseMinWith : width) || baseMinWith;
  const rowNumColumn = isRowNumColumn(name);

  const defaultHeader = rowNumColumn ? 'No. ' : DEF_ROW_HEADER_INPUT;
  const rendererOptions = renderer || {
    type: rowNumColumn ? DefaultRenderer : RowHeaderInputRenderer
  };
  const { headerAlign, headerVAlign } = getHeaderAlignInfo(name, alignInfo);

  return observable({
    name,
    header: header || defaultHeader,
    hidden: false,
    resizable: false,
    align: align || 'center',
    renderer: getRendererOptions(rendererOptions),
    fixedWidth: true,
    baseWidth,
    escapeHTML: false,
    minWidth: baseMinWith,
    headerAlign,
    headerVAlign
  });
}

function createComplexHeaderColumns(column: ComplexColumnInfo, alignInfo: HeaderAlignInfo) {
  const { header, name, childNames, sortable, sortingType } = column;
  const { headerAlign, headerVAlign } = getHeaderAlignInfo(name, alignInfo);

  return observable({
    header,
    name,
    childNames,
    sortable,
    sortingType,
    headerAlign,
    headerVAlign
  });
}

interface ColumnOptions {
  columns: OptColumn[];
  columnOptions: OptColumnOptions;
  rowHeaders: OptRowHeader[];
  copyOptions: ClipboardCopyOptions;
  keyColumnName?: string;
  treeColumnOptions: OptTree;
  complexColumns: ComplexColumnInfo[];
  align: AlignType;
  valign: VAlignType;
  columnsAlign: ColumnsAlignInfo[];
}

export function create({
  columns,
  columnOptions,
  rowHeaders,
  copyOptions,
  keyColumnName,
  treeColumnOptions,
  complexColumns,
  align,
  valign,
  columnsAlign
}: ColumnOptions): Column {
  const relationColumns = columns.reduce((acc: string[], { relations }) => {
    acc = acc.concat(getRelationColumns(relations || []));
    return acc.filter((columnName, idx) => acc.indexOf(columnName) === idx);
  }, []);

  columnsAlign.forEach(columnAlign => {
    columnAlign.align = columnAlign.align || align;
    columnAlign.valign = columnAlign.valign || valign;
  });
  const headerAlignInfo = { columnsAlign, align, valign };

  const rowHeaderInfos = rowHeaders.map(rowHeader => createRowHeader(rowHeader, headerAlignInfo));

  const columnInfos = columns.map(column =>
    createColumn(
      column,
      columnOptions,
      relationColumns,
      copyOptions,
      treeColumnOptions,
      headerAlignInfo
    )
  );
  const allColumns = rowHeaderInfos.concat(columnInfos);

  const {
    name: treeColumnName,
    useIcon: treeIcon = true,
    useCascadingCheckbox: treeCascadingCheckbox = true
  } = treeColumnOptions;

  const complexHeaderColumns = complexColumns.map(column =>
    createComplexHeaderColumns(column, headerAlignInfo)
  );

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
    complexHeaderColumns,
    headerAlignInfo,

    get allColumnMap() {
      return createMapFromArray(this.allColumns, 'name') as Dictionary<ColumnInfo>;
    },

    get rowHeaderCount() {
      return rowHeaderInfos.length;
    },

    get visibleColumns() {
      return this.allColumns.slice(this.rowHeaderCount).filter(({ hidden }) => !hidden);
    },

    get visibleColumnsWithRowHeader() {
      return this.allColumns.filter(({ hidden }) => !hidden);
    },

    get visibleColumnsBySide() {
      return {
        L: this.visibleColumns.slice(0, this.frozenCount),
        R: this.visibleColumns.slice(this.frozenCount)
      };
    },

    get visibleColumnsBySideWithRowHeader() {
      const frozenLastIndex = this.rowHeaderCount + this.frozenCount;

      return {
        L: this.visibleColumnsWithRowHeader.slice(0, frozenLastIndex),
        R: this.visibleColumnsWithRowHeader.slice(frozenLastIndex)
      };
    },

    get defaultValues() {
      return this.allColumns
        .filter(({ defaultValue }) => Boolean(defaultValue))
        .map(({ name, defaultValue }) => ({ name, value: defaultValue }));
    },

    get visibleFrozenCount(this: Column) {
      return this.visibleColumnsBySideWithRowHeader.L.length;
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
