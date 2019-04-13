import { Row, Column, Range, Viewport, Dimension } from './types';
import { reactive, Reactive } from '../helper/reactive';
import { arrayEqual } from '../helper/common';

function indexOfRow(rowOffsets: number[], posY: number) {
  const offset = rowOffsets.findIndex((offset) => offset > posY);
  return offset === -1 ? rowOffsets.length - 1 : offset - 1;
}

interface ViewPortOption {
  data: Row[];
  column: Column;
  dimension: Dimension;
}

export function create({ data, column, dimension }: ViewPortOption): Reactive<Viewport> {
  const { visibleColumns } = column;

  return reactive({
    scrollLeft: 0,
    scrollTop: 0,
    get colRange(this: Viewport) {
      return <Range>[0, visibleColumns.L.length + visibleColumns.R.length];
    },
    get rowRange(this: Reactive<Viewport>) {
      const { rowOffsets, bodyHeight } = dimension;

      // safari uses negative scrollTop for bouncing effect
      const scrollY = Math.max(this.scrollTop, 0);

      const start = indexOfRow(rowOffsets, scrollY);
      const end = indexOfRow(rowOffsets, scrollY + bodyHeight) + 1;
      const value = <Range>[start, end];

      const prevValue = this.__storage__.rowRange;
      if (prevValue && arrayEqual(prevValue, value)) {
        return prevValue;
      }
      return value;
    },
    get rows(this: Viewport) {
      return data.slice(...this.rowRange);
    },
    get offsetY(this: Viewport) {
      return dimension.rowOffsets[this.rowRange[0]];
    }
  });
}
