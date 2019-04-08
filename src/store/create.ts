import { Store } from './types';
import { OptGrid } from '../types';
import { reactive } from '../helper/reactive';
import { create as createViewport } from './viewport';
import { create as createDimension } from './dimension';
import { create as createColumns } from './columns';
import { create as createColumnCoords } from './columnCoords';

export function createStore(options: OptGrid): Store {
  const { width, rowHeight, bodyHeight, minBodyHeight } = options;

  const data = options.data || [];
  const columns = createColumns(options.columns, options.columnOptions);
  const dimension = createDimension({ data, width, rowHeight, bodyHeight, minBodyHeight });
  const viewport = createViewport({ data, columns, dimension });
  const columnCoords = createColumnCoords(columns, dimension);

  return reactive({
    data,
    columns,
    dimension,
    columnCoords,
    viewport
  });
}
