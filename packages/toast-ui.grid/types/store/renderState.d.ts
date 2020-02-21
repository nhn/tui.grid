import { Dictionary } from '../options';
import { RowKey } from './data';

export type CellHeightMap = Dictionary<Dictionary<number>>;

export interface RenderState {
  hoveredRowKey: RowKey | null;
  cellHeightMap: CellHeightMap;
}
