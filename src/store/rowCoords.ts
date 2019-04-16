import { Data, Dimension, RowCoords } from './types';
import { reactive } from '../helper/reactive';

interface RowCoordsOption {
  data: Data;
  dimension: Dimension;
}

export function create({ data, dimension }: RowCoordsOption): RowCoords {
  return reactive({
    heights: [],

    get offsets() {
      const offsets = [0];
      const { rowHeight } = dimension;

      for (let i = 1, len = data.viewData.length; i < len; i += 1) {
        offsets.push(offsets[i - 1] + rowHeight + 1);
      }
      return offsets;
    }
  });
}
