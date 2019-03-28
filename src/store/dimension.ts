import { Row, Dimension } from './types';
import { reactive } from '../helper/reactive';

interface DimensionOption {
  data: Row[];
  width?: number;
  rowHeight?: number;
  bodyHeight?: number
}

export function create({ data, width = 1000, rowHeight = 40, bodyHeight = 1000 }: DimensionOption): Dimension {
  return reactive<Dimension>({
    width,
    bodyHeight,
    rowHeight,
    colOffsets: [],
    get totalRowHeight() {
      return data.length * (this.rowHeight + 1)
    },
    get rowOffsets() {
      const offsets = [0];
      const { rowHeight } = this;
      for (let i = 1, len = data.length; i < len; i += 1) {
        offsets.push(offsets[i - 1] + rowHeight + 1);
      }
      return offsets;
    },
  });
}