import { Data, Dimension, RowCoords } from './types';
import { observable } from '../helper/observable';

interface RowCoordsOption {
  data: Data;
  dimension: Dimension;
}

export function create({ data, dimension }: RowCoordsOption): RowCoords {
  return observable({
    get heights() {
      const heights = [];
      const { rowHeight, minRowHeight } = dimension;
      for (let i = 0, len = data.viewData.length; i < len; i += 1) {
        heights[i] = Math.max(rowHeight, minRowHeight);
      }

      return heights;
    },

    get offsets() {
      const offsets = [0];
      const { heights } = this;

      for (let i = 1, len = heights.length; i < len; i += 1) {
        offsets[i] = offsets[i - 1] + heights[i - 1];
      }

      return offsets;
    },

    get totalRowHeight() {
      const { offsets, heights } = this;
      return offsets[offsets.length - 1] + heights[heights.length - 1];
    }
  });
}
