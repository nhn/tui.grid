import { CellHeightMap } from './types';
import { observable } from '../helper/observable';

export function create() {
  return observable({ hoveredRowKey: null, cellHeightMap: {} as CellHeightMap });
}
