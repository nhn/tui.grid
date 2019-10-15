import { CellHeightMap } from './types';

export function create() {
  return { hoveredRowKey: null, cellHeightMap: {} as CellHeightMap };
}
