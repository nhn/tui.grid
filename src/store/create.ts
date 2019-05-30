import { Store } from './types';
import { OptGrid } from '../types';
import { observable, observe } from '..//helper/observable';
import { create as createData } from './data';
import { create as createColumn } from './columns';
import { create as createDimension, setBodyHeight } from './dimension';
import { create as createViewport } from './viewport';
import { create as createColumnCoords } from './columnCoords';
import { create as createRowCoords } from './rowCoords';
import { create as createFocus } from './focus';
import { create as createSummary } from './summary';
import { create as createSelection } from './selection';

export function createStore(id: number, options: OptGrid): Store {
  const {
    el,
    width,
    rowHeight,
    bodyHeight,
    minBodyHeight,
    columnOptions = {},
    keyColumnName,
    rowHeaders = [],
    copyOptions = {},
    summary: summaryOptions = {},
    selectionUnit = 'cell',
    showDummyRows = false,
    editingEvent = 'dblclick'
  } = options;
  const { frozenBorderWidth } = columnOptions;
  const { height: summaryHeight, position: summaryPosition } = summaryOptions;
  const column = createColumn({
    columns: options.columns,
    columnOptions,
    rowHeaders,
    copyOptions,
    keyColumnName
  });
  const data = createData(options.data || [], column);
  const dimension = createDimension({
    column,
    width,
    domWidth: el.clientWidth,
    rowHeight,
    bodyHeight,
    minBodyHeight,
    frozenBorderWidth,
    summaryHeight,
    summaryPosition
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
  const focus = createFocus({ data, column, columnCoords, rowCoords, editingEvent });
  const summary = createSummary({ column, data, summary: summaryOptions });
  const selection = createSelection({ selectionUnit, columnCoords, column, dimension, rowCoords });

  // manual observe to resolve circular references
  observe(() => {
    setBodyHeight(dimension, rowCoords);
  });

  return observable({
    id,
    data,
    column,
    dimension,
    columnCoords,
    rowCoords,
    viewport,
    focus,
    summary,
    selection
  });
}
