import { Data, RenderState } from './types';
import { observable } from '../helper/observable';

export function create(data: Data) {
  const state = data.rawData.length ? 'DONE' : 'EMPTY';
  return observable<RenderState>({ state });
}
