import { Store } from './types';
import { OptGrid } from '../types';
import { reactive } from '../helper/reactive';
import { create as createData } from './data';
import { create as createColumn } from './columns';
import { create as createDimension } from './dimension';
import { create as createViewport } from './viewport';
import { create as createColumnCoords } from './columnCoords';
import { create as createRowCoords } from './rowCoords';
import { create as createFocus } from './focus';
import { create as createSummary } from './summary';
import { create as createSelection } from './selection';
import { create as createClipboard } from './clipboard';

export function createStore(id: number, options: OptGrid): Store {
  const {
    width,
    rowHeight,
    bodyHeight,
    minBodyHeight,
    columnOptions = {},
    rowHeaders = [],
    summary: summaryOptions = {},
    selectionUnit = 'cell',
    copyOptions = {}
  } = options;
  const { frozenBorderWidth } = columnOptions;
  const { height: summaryHeight, position: summaryPosition } = summaryOptions;
  const column = createColumn(options.columns, columnOptions, rowHeaders);
  const data = createData(options.data || [], column);
  const dimension = createDimension({
    data,
    column,
    width,
    rowHeight,
    bodyHeight,
    minBodyHeight,
    frozenBorderWidth,
    summaryHeight,
    summaryPosition
  });
  const columnCoords = createColumnCoords({ column, dimension });
  const rowCoords = createRowCoords({ data, dimension });
  const viewport = createViewport({ data, column, dimension, rowCoords, columnCoords });
  const focus = createFocus({ data, column, columnCoords, rowCoords });
  const summary = createSummary({ column, data, summary: summaryOptions });
  const selection = createSelection({ selectionUnit, columnCoords, column, dimension, rowCoords });
  const clipboard = createClipboard({ copyOptions, selection });

  return reactive({
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
    clipboard
  });
}
