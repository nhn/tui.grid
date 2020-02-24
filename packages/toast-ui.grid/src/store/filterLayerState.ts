import { FilterLayerState } from '@t/store/filterLayerState';
import { observable } from '../helper/observable';

export function create() {
  return observable<FilterLayerState>({ activeColumnAddress: null, activeFilterState: null });
}
