import {
  Column,
  ColumnInfo,
  Dictionary,
  Relations,
  ClipboardCopyOptions,
  CellEditorOptions,
  CellRendererOptions,
  ColumnFilterOption,
  ColumnHeaderInfo
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
  FilterOpt,
  FilterOptionType,
  OptColumnHeaderInfo,
  OptComplexColumnInfo
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
  findProp,
  uniq,
  isEmpty
} from '../helper/common';
import { DefaultRenderer } from '../renderer/default';
import { editorMap } from '../editor/manager';
import { RowHeaderInputRenderer } from '../renderer/rowHeaderInput';

const DEF_ROW_HEADER_INPUT = '<input type="checkbox" name="_checked" />';
const ROW_HEADER = 40;
const COLUMN = 50;
const rowHeadersMap = {
  rowNum: '_number',
  checkbox: '_checked'
};

export function validateRelationColumn(columnInfos: ColumnInfo[]) {
  const checked: Dictionary<boolean> = {};

  function checkCircularRelation(column: ColumnInfo, relations: string[]) {
    const { name, relationMap } = column;

    relations.push(name);
    checked[name] = true;

    if (uniq(relations).length !== relations.length) {
      throw new Error('Cannot create circular reference between relation columns');
    }

    if (!isUndefined(relationMap)) {
      Object.keys(relationMap).forEach(targetName => {
        const targetColumn = findProp('name', targetName, columnInfos)!;
        // copy the 'relation' array to prevent to push all relation column into same array
        checkCircularRelation(targetColumn, [...relations]);
      });
    }
  }

  columnInfos.forEach(column => {
    if (!checked[column.name]) {
      checkCircularRelation(column, []);
    }
  });
}

function createBuiltInEditorOptions(editorType: string, options?: Dictionary<any>) {
  const editInfo = editorMap[editorType];

  return {
    type: editInfo[0],
    options: {
      ...editInfo[1],
      ...options
    }
  };
}

function createEditorOptions(editor?: OptCellEditor): CellEditorOptions | null {
  if (isFunction(editor)) {
    return { type: editor };
  }
  if (isString(editor)) {
    return createBuiltInEditorOptions(editor);
  }
  if (isObject(editor)) {
    return isString(editor.type)
      ? createBuiltInEditorOptions(editor.type, editor.options)
      : (editor as CellEditorOptions);
  }
  return null;
}

function createRendererOptions(renderer?: OptCellRenderer): CellRendererOptions {
  if (isObject(renderer) && !isFunction(renderer) && isFunction(renderer.type)) {
    return renderer as CellRendererOptions;
  }
  return { type: DefaultRenderer };
}

function createTreeInfo(treeColumnOptions: OptTree, name: string) {
  if (treeColumnOptions && treeColumnOptions.name === name) {
    const { useIcon = true } = treeColumnOptions;

    return { tree: { useIcon } };
  }

  return null;
}

function createRelationMap(relations: Relations[]) {
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

function createColumnHeaderInfo(name: string, columnHeaderInfo: ColumnHeaderInfo) {
  const { columnHeaders, align: defaultAlign, valign: defaultVAlign } = columnHeaderInfo;
  const columnOption = findProp('name', name, columnHeaders);
  const headerAlign = columnOption && columnOption.align ? columnOption.align : defaultAlign;
  const headerVAlign = columnOption && columnOption.valign ? columnOption.valign : defaultVAlign;
  const headerRenderer = columnOption && columnOption.renderer ? columnOption.renderer : null;

  return {
    headerAlign,
    headerVAlign,
    headerRenderer
  };
}

export function createColumnFilterOption(filter: FilterOptionType | FilterOpt): ColumnFilterOption {
  const defaultOption = {
    type: isObject(filter) ? filter.type : filter!,
    showApplyBtn: false,
    showClearBtn: false
  };

  if (isString(filter)) {
    if (filter === 'select') {
      return {
        ...defaultOption,
        operator: 'OR'
      };
    }
  }

  if (isObject(filter)) {
    return {
      ...defaultOption,
      ...filter
    };
  }

  return defaultOption;
}

export function createRelationColumns(relations: Relations[]) {
  const relationColumns: string[] = [];
  relations.forEach(relation => {
    const { targetNames = [] } = relation;
    targetNames.forEach(targetName => {
      relationColumns.push(targetName);
    });
  });

  return relationColumns;
}

// eslint-disable-next-line max-params
export function createColumn(
  column: OptColumn,
  columnOptions: OptColumnOptions,
  relationColumns: string[],
  gridCopyOptions: ClipboardCopyOptions,
  treeColumnOptions: OptTree,
  columnHeaderInfo: ColumnHeaderInfo
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
    ignored,
    filter,
    className
  } = column;

  const editorOptions = createEditorOptions(editor);
  const rendererOptions = createRendererOptions(renderer);
  const filterOptions = filter ? createColumnFilterOption(filter) : null;
  const { headerAlign, headerVAlign, headerRenderer } = createColumnHeaderInfo(
    name,
    columnHeaderInfo
  );

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
    minWidth: minWidth || columnOptions.minWidth || COLUMN, // @TODO meta tag 체크 여부
    relationMap: createRelationMap(relations || []),
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
    ...createTreeInfo(treeColumnOptions, name),
    headerAlign,
    headerVAlign,
    filter: filterOptions,
    headerRenderer,
    className
  });
}

function createRowHeader(data: OptRowHeader, columnHeaderInfo: ColumnHeaderInfo): ColumnInfo {
  const rowHeader: OptColumn = isString(data)
    ? { name: rowHeadersMap[data] }
    : { name: rowHeadersMap[data.type], ...omit(data, 'type') };
  const { name, header, align, valign, renderer, width, minWidth } = rowHeader;
  const baseMinWith = isNumber(minWidth) ? minWidth : ROW_HEADER;
  const baseWidth = (width === 'auto' ? baseMinWith : width) || baseMinWith;
  const rowNumColumn = isRowNumColumn(name);

  const defaultHeader = rowNumColumn ? 'No. ' : DEF_ROW_HEADER_INPUT;
  const rendererOptions = renderer || {
    type: rowNumColumn ? DefaultRenderer : RowHeaderInputRenderer
  };

  const { headerAlign, headerVAlign, headerRenderer } = createColumnHeaderInfo(
    name,
    columnHeaderInfo
  );

  return observable({
    name,
    header: header || defaultHeader,
    hidden: false,
    resizable: false,
    align: align || 'center',
    valign: valign || 'middle',
    renderer: createRendererOptions(rendererOptions),
    fixedWidth: true,
    baseWidth,
    escapeHTML: false,
    minWidth: baseMinWith,
    headerAlign,
    headerVAlign,
    headerRenderer
  });
}

function createComplexColumnHeaders(
  column: OptComplexColumnInfo,
  columnHeaderInfo: ColumnHeaderInfo
) {
  const {
    header,
    name,
    childNames,
    sortable,
    sortingType,
    renderer,
    hideChildHeaders,
    resizable = false
  } = column;
  const headerAlign = column.headerAlign || columnHeaderInfo.align;
  const headerVAlign = column.headerVAlign || columnHeaderInfo.valign;

  return observable({
    header,
    name,
    childNames,
    sortable,
    sortingType,
    headerAlign,
    headerVAlign,
    headerRenderer: renderer || null,
    hideChildHeaders,
    resizable
  });
}

interface ColumnOption {
  columns: OptColumn[];
  columnOptions: OptColumnOptions;
  rowHeaders: OptRowHeader[];
  copyOptions: ClipboardCopyOptions;
  keyColumnName?: string;
  treeColumnOptions: OptTree;
  complexColumns: OptComplexColumnInfo[];
  align: AlignType;
  valign: VAlignType;
  columnHeaders: OptColumnHeaderInfo[];
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
  columnHeaders
}: ColumnOption): Column {
  const relationColumns = columns.reduce((acc: string[], { relations }) => {
    acc = acc.concat(createRelationColumns(relations || []));
    return acc.filter((columnName, idx) => acc.indexOf(columnName) === idx);
  }, []);

  const columnHeaderInfo = { columnHeaders, align, valign };
  const rowHeaderInfos = rowHeaders.map(rowHeader => createRowHeader(rowHeader, columnHeaderInfo));

  const columnInfos = columns.map(column =>
    createColumn(
      column,
      columnOptions,
      relationColumns,
      copyOptions,
      treeColumnOptions,
      columnHeaderInfo
    )
  );

  validateRelationColumn(columnInfos);

  const allColumns = rowHeaderInfos.concat(columnInfos);

  const {
    name: treeColumnName,
    useIcon: treeIcon = true,
    useCascadingCheckbox: treeCascadingCheckbox = true
  } = treeColumnOptions;

  const complexColumnHeaders = complexColumns.map(column =>
    createComplexColumnHeaders(column, columnHeaderInfo)
  );

  return observable({
    keyColumnName,
    allColumns,
    complexColumnHeaders,
    columnHeaderInfo,
    frozenCount: columnOptions.frozenCount || 0,

    dataForColumnCreation: {
      copyOptions,
      columnOptions,
      treeColumnOptions,
      relationColumns,
      rowHeaders: rowHeaderInfos
    },

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

    get columnMapWithRelation() {
      // copy the array to prevent to affect allColumns property
      const copiedColumns = [...this.allColumns];
      copiedColumns.sort((columnA, columnB) => {
        if (columnA.relationMap?.[columnB.name]) {
          return -1;
        }
        return columnB.relationMap?.[columnA.name] ? 1 : 0;
      });

      return createMapFromArray(copiedColumns, 'name');
    },

    ...(treeColumnName && { treeColumnName, treeIcon, treeCascadingCheckbox })
  });
}
