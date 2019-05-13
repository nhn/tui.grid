import { Selection, SelectionType, SelectionUnit } from './types';
import { Reactive, reactive } from '../helper/reactive';

export function create(): Reactive<Selection> {
  return reactive({
    startData: null,
    active: false,
    inputRange: null,
    range: null,
    // minimumColumnRange?: Range,
    type: 'cell' as SelectionType,
    unit: 'cell' as SelectionUnit
  });
}
