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
      const { rowHeight } = dimension;
      for (let i = 0, len = data.viewData.length; i < len; i += 1) {
        heights[i] = rowHeight;
      }

      return heights;
    },

    get offsets() {
      const offsets = [0];
      const { rowHeight } = dimension;

      for (let i = 1, len = data.viewData.length; i < len; i += 1) {
        offsets.push(offsets[i - 1] + rowHeight);
      }

      return offsets;
    }
  });
}
