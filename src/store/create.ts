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
import { create as createSelection } from './selection';

export function createStore(options: OptGrid): Store {
  const { width, rowHeight, bodyHeight, minBodyHeight, columnOptions = {} } = options;
  const { frozenBorderWidth } = columnOptions;

  const data = createData(options.data || []);
  const column = createColumn(options.columns, columnOptions);
  const dimension = createDimension({
    data,
    column,
    width,
    rowHeight,
    bodyHeight,
    minBodyHeight,
    frozenBorderWidth
  });
  const columnCoords = createColumnCoords({ column, dimension });
  const rowCoords = createRowCoords({ data, dimension });
  const viewport = createViewport({ data, column, dimension, rowCoords, columnCoords });
  const focus = createFocus({ data, column, columnCoords, rowCoords });
  const selection = createSelection();

  return reactive({
    data,
    column,
    dimension,
    columnCoords,
    rowCoords,
    viewport,
    focus,
    selection
  });
}
