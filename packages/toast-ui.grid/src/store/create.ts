import { Store } from '@t/store';
import { OptGrid } from '@t/options';
import { observable, observe } from '../helper/observable';
import { create as createData } from './data';
import { create as createColumn } from './column';
import { create as createDimension } from './dimension';
import { create as createViewport } from './viewport';
import { create as createColumnCoords } from './columnCoords';
import { create as createRowCoords } from './rowCoords';
import { create as createFocus } from './focus';
import { create as createSummary } from './summary';
import { create as createSelection } from './selection';
import { create as createRenderState } from './renderState';
import { create as createFilterLayerState } from './filterLayerState';
import { create as createContextMenu } from './contextMenu';
import { setAutoBodyHeight } from '../dispatch/dimension';
import { createObservableData } from '../dispatch/lazyObservable';
import { createNewValidationMap } from './helper/validation';

export function createStore(id: number, options: OptGrid): Store {
  createNewValidationMap(id);
  const {
    el,
    width,
    rowHeight,
    bodyHeight,
    heightResizable,
    minRowHeight,
    minBodyHeight,
    columnOptions = {},
    keyColumnName,
    rowHeaders = [],
    copyOptions = {},
    summary: summaryOptions = {},
    selectionUnit = 'cell',
    showDummyRows = false,
    editingEvent = 'dblclick',
    tabMode = 'moveAndEdit',
    scrollX,
    scrollY,
    useClientSort = true,
    pageOptions = {},
    treeColumnOptions = { name: '' },
    header = {},
    disabled = false,
    draggable = false,
  } = options;
  const { frozenBorderWidth } = columnOptions;
  const { height: summaryHeight, position: summaryPosition } = summaryOptions;
  const {
    height: headerHeight = 40,
    complexColumns = [],
    align = 'center',
    valign = 'middle',
    columns: columnHeaders = [],
  } = header;
  const column = createColumn({
    columns: options.columns,
    columnOptions,
    rowHeaders,
    copyOptions,
    keyColumnName,
    treeColumnOptions,
    complexColumns,
    align,
    valign,
    columnHeaders,
    disabled,
    draggable,
  });
  const data = createData({
    data: Array.isArray(options.data) ? options.data : [],
    column,
    pageOptions,
    useClientSort,
    id,
    disabled,
  });
  const dimension = createDimension({
    column,
    width,
    domWidth: el.clientWidth,
    rowHeight,
    bodyHeight,
    minBodyHeight,
    minRowHeight,
    heightResizable,
    frozenBorderWidth,
    summaryHeight,
    summaryPosition,
    scrollX,
    scrollY,
    headerHeight,
  });
  const columnCoords = createColumnCoords({ column, dimension });
  const rowCoords = createRowCoords({ data, dimension });
  const viewport = createViewport({
    data,
    column,
    dimension,
    rowCoords,
    columnCoords,
    showDummyRows,
  });
  const focus = createFocus({
    data,
    column,
    dimension,
    columnCoords,
    rowCoords,
    editingEvent,
    tabMode,
    id,
  });
  const summary = createSummary({ column, data, summary: summaryOptions });
  const selection = createSelection({
    selectionUnit,
    columnCoords,
    column,
    dimension,
    rowCoords,
    data,
  });
  const filterLayerState = createFilterLayerState();
  const renderState = createRenderState();
  const contextMenu = createContextMenu();

  const store = observable({
    id,
    data,
    column,
    dimension,
    columnCoords,
    rowCoords,
    viewport,
    focus,
    summary,
    selection,
    renderState,
    filterLayerState,
    contextMenu,
  });
  // manual observe to resolve circular references
  observe(() => {
    setAutoBodyHeight(store);
  });
  // makes the data observable as changes viewport
  observe(
    () => {
      createObservableData(store);
    },
    false,
    'lazyObservable'
  );

  return store;
}
