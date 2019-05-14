import { Selection, SelectionType, SelectionUnit } from './types';
import { Reactive, reactive } from '../helper/reactive';

export function create(): Reactive<Selection> {
  return reactive({
    startData: null,
    active: false,
    range: null,
    type: 'cell' as SelectionType,
    unit: 'cell' as SelectionUnit,
    scrollPixelScale: 40,
    intervalIdForAutoScroll: null
    // minimumColumnRange?: Range,
  });
}
