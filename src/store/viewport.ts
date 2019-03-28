import { Row, Column, Range, Viewport, Dimension } from './types';
import { reactive } from '../helper/reactive';
import { arrayEqual } from '../helper/common';

function indexOfRow(rowOffsets: number[], posY: number) {
  return rowOffsets.findIndex(offset => offset > posY) - 1;
}
interface ViewPortOption {
  data: Row[];
  columns: Column[];
  dimension: Dimension
}

export function create({ data, columns, dimension }: ViewPortOption): Viewport {
  return reactive({
    colsL: [],
    colsR: [...columns],
    rowsL: [],
    scrollX: 0,
    scrollY: 0,
    colRange: <Range>[0, columns.length],
    get rowRange(this: (Viewport & { __storage__: Viewport })) {
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
    get rowsR(this: Viewport) {
      return data.slice(...this.rowRange);
    },
    get offsetY(this: Viewport) {
      return dimension.rowOffsets[this.rowRange[0]]
    }
  });
}
