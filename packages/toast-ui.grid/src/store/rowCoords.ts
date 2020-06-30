import { Data } from '@t/store/data';
import { Dimension } from '@t/store/dimension';
import { RowCoords } from '@t/store/rowCoords';
import { observable } from '../helper/observable';
import { last } from '../helper/common';
import { getRowHeight } from '../query/data';

interface RowCoordsOption {
  data: Data;
  dimension: Dimension;
}

export function create({ data, dimension }: RowCoordsOption) {
  const { rowHeight } = dimension;
  const { pageOptions, pageRowRange } = data;

  return observable<RowCoords>({
    heights: pageOptions.useClient
      ? data.filteredRawData.slice(...pageRowRange).map((row) => getRowHeight(row, rowHeight))
      : data.filteredRawData.map((row) => getRowHeight(row, rowHeight)),

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
    },
  });
}
