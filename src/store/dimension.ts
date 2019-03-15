import { Row } from './types';
import { reactive } from '../helper/reactive';

export function create(data: Row[], width: number, rowHeight: number, bodyHeight: number) {
  return reactive({
    width,
    bodyHeight,
    rowHeight: rowHeight || 40,
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