import { Store } from './types';
import { OptGrid } from '../types';
import { reactive } from '../helper/reactive';
import { create as createViewport } from './viewport';
import { create as createDimension } from './dimension';
import { create as createColumn } from './columns';
import { create as createColumnCoords } from './columnCoords';

export function createStore(options: OptGrid): Store {
  const { width, rowHeight, bodyHeight, minBodyHeight } = options;

  const data = options.data || [];
  const column = createColumn(options.columns, options.columnOptions);
  const dimension = createDimension({ data, width, rowHeight, bodyHeight, minBodyHeight });
  const viewport = createViewport({ data, column, dimension });
  const columnCoords = createColumnCoords(column, dimension);

  return reactive({
    data,
    column,
    dimension,
    columnCoords,
    viewport
  });
}
