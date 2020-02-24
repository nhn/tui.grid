import { CellHeightMap } from '@t/store/renderState';
import { observable } from '../helper/observable';

export function create() {
  return observable({ hoveredRowKey: null, cellHeightMap: {} as CellHeightMap });
}
