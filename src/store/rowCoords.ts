import { Data, Dimension, RowCoords, Row } from './types';
import { observable } from '../helper/observable';
import { isNumber, last } from '../helper/common';

interface RowCoordsOption {
  data: Data;
  dimension: Dimension;
}

export function getRowHeight(row: Row, defaultRowHeight: number) {
  const { height, tree } = row._attributes;
  const rowHeight = tree && tree.hidden ? 0 : height;

  return isNumber(rowHeight) ? rowHeight : defaultRowHeight;
}

export function create({ data, dimension }: RowCoordsOption): RowCoords {
  const { rowHeight } = dimension;

  return observable({
    heights: data.rawData.map(row => getRowHeight(row, rowHeight)),

    get offsets() {
      const offsets = [0];
      const { heights } = this;

      for (let i = 1, len = heights.length; i < len; i += 1) {
        offsets[i] = offsets[i - 1] + heights[i - 1];
      }

      return offsets;
    },

    get totalRowHeight() {
      return this.heights.length ? last(this.offsets) + last(this.heights) : 0;
    }
  });
}
