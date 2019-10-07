import { Data, RenderState } from './types';
import { observable } from '../helper/observable';

// @TODO: change name, bring cellHeightMap from context
export function create(data: Data) {
  const state = data.rawData.length ? 'DONE' : 'EMPTY';
  return observable<RenderState>({ state, hoveredRowKey: null });
}
