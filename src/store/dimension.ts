import { Row, Dimension } from './types';
import { reactive } from '../helper/reactive';

interface DimensionOption {
  data: Row[];
  width?: number | 'auto';
  rowHeight?: number;
  bodyHeight?: number;
}

export function create({
  data,
  width = 'auto',
  rowHeight = 40,
  bodyHeight = 1000
}: DimensionOption): Dimension {
  return reactive<Dimension>({
    width: width === 'auto' ? 0 : width,
    autoWidth: width === 'auto',
    bodyHeight,
    rowHeight,
    colOffsets: [],
    scrollbarWidth: 17,
    lsideWidth: 0,
    get rsideWidth() {
      return this.width;
    },
    get totalRowHeight() {
      return data.length * (this.rowHeight + 1);
    },
    get rowOffsets() {
      const offsets = [0];
      const { rowHeight } = this;
      for (let i = 1, len = data.length; i < len; i += 1) {
        offsets.push(offsets[i - 1] + rowHeight + 1);
      }
      return offsets;
    }
  });
}
