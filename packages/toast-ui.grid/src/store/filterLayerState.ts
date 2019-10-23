import { FilterLayerState } from './types';
import { observable } from '../helper/observable';

export function create() {
  return observable<FilterLayerState>({ activeColumnAddress: null, activeFilterState: null });
}
