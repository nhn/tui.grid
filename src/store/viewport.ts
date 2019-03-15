import { Row, Column, Range, Store, Viewport, Dimension } from './types';
import { reactive, watch } from '../helper/reactive';
import { arrayEqual } from '../helper/common';

function indexOfRow(rowOffsets: number[], posY: number) {
  return rowOffsets.findIndex(offset => offset > posY) - 1;
}

export function create(rows: Row[], columns: Column[], dimension: Dimension): Viewport {
  return reactive({
    colsL: [],
    colsR: [...columns],
    rowsL: [],
    scrollX: 0,
    scrollY: 0,
    colRange: <Range>[0, columns.length],
    get rowRange() {
      const { rowOffsets, bodyHeight } = dimension;
      const { scrollY } = this;

      const start = indexOfRow(rowOffsets, scrollY);
      const end = indexOfRow(rowOffsets, scrollY + bodyHeight) + 1
      const value = <Range>[start, end];

      const prevValue = this.__storage__.rowRange;
      if (prevValue && arrayEqual(prevValue, value)) {
        return prevValue
      }
      return value;
    },
    get rowsR() {
      return rows.slice(...this.rowRange);
    },
    get offsetY() {
      return dimension.rowOffsets[this.rowRange[0]]
    }
  });
}
