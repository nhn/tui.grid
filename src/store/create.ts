import { Row, Column, Range, Store, Viewport } from './types';
import { OptGrid } from '../types';
import { reactive } from './reactive';

function rowOffsets(len: number, rowHeight = 40) {
  const offsets = [0];
  for (let i = 1; i < len; i += 1) {
    offsets.push(offsets[i - 1] + rowHeight + 1);
  }
  return offsets;
}

function viewport(rows: Row[], columns: Column[]): Viewport {
  return <Viewport>reactive({
    rowRange: <Range>[0, rows.length],
    colRange: <Range>[0, columns.length],
    colsL: [],
    colsR: [...columns],
    rowsL: [],
    rowsR: rows.slice(0, 20),
    scrollX: 0,
    scrollY: 0,
    offsetY: 0
  });
}

export function createStore(options: OptGrid): Store {
  return reactive({
    data: options.data || [],
    columns: <Column[]>options.columns,
    viewport: viewport(options.data, <Column[]>options.columns),
    dimension: reactive({
      rowOffsets: rowOffsets(options.data.length, options.rowHeight),
      colOffsets: [],
      width: options.width,
      bodyHeight: options.bodyHeight,
      totalRowHeight: options.data.length * 40
    })
  })
}

