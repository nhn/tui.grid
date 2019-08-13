import { Store } from './types';
import { OptGrid } from '../types';
import { observable, observe } from '../helper/observable';
import { create as createData } from './data';
import { create as createColumn } from './column';
import { create as createDimension, setBodyHeight } from './dimension';
import { create as createViewport } from './viewport';
import { create as createColumnCoords } from './columnCoords';
import { create as createRowCoords } from './rowCoords';
import { create as createFocus } from './focus';
import { create as createSummary } from './summary';
import { create as createSelection } from './selection';
import { create as createRenderState } from './renderState';
import { createObservableData } from '../dispatch/data';

export function createStore(id: number, options: OptGrid): Store {
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
    scrollX,
    scrollY,
    useClientSort = true,
    pageOptions = {},
    treeColumnOptions = { name: '' },
    header = {},
    disabled = false
  } = options;
  const { frozenBorderWidth } = columnOptions;
  const { height: summaryHeight, position: summaryPosition } = summaryOptions;
  const {
    height: headerHeight = 40,
    complexColumns = [],
    align = 'center',
    valign = 'middle',
    columns: columnsAlign = []
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
    columnsAlign
  });
  const data = createData(
    Array.isArray(options.data) ? options.data : [],
    column,
    pageOptions,
    useClientSort,
    disabled
  );
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
    headerHeight
  });
  const columnCoords = createColumnCoords({ column, dimension });
  const rowCoords = createRowCoords({ data, dimension });
  const viewport = createViewport({
    data,
    column,
    dimension,
    rowCoords,
    columnCoords,
    showDummyRows
  });
  const focus = createFocus({ data, column, columnCoords, rowCoords, editingEvent, id });
  const summary = createSummary({ column, data, summary: summaryOptions });
  const selection = createSelection({ selectionUnit, columnCoords, column, dimension, rowCoords });
  const renderState = createRenderState(data);

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
    renderState
  });
  // manual observe to resolve circular references
  observe(() => {
    setBodyHeight(dimension, rowCoords);
  });
  // makes the data observable as changes viewport
  observe(() => {
    createObservableData(store);
  });

  return store;
}
