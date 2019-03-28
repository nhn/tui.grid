import { Row, Column, Range, Store, Viewport } from './types';
import { OptGrid } from '../types';
import { reactive } from '../helper/reactive';
import { create as createViewport } from './viewport';
import { create as createDimension } from './dimension';

export function createStore(options: OptGrid): Store {
  const { width, rowHeight, bodyHeight } = options;

  const data = options.data || [];
  const columns = <Column[]>options.columns;
  const dimension = createDimension(data, width, rowHeight, bodyHeight);
  const viewport = createViewport(data, columns, dimension);

  return reactive({
    data,
    columns,
    dimension,
    viewport
  })
}

