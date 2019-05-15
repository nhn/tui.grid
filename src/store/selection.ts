import { Selection, SelectionType, SelectionUnit } from './types';
import { Reactive, reactive } from '../helper/reactive';

interface SelectionOptions {
  selectionUnit: SelectionUnit;
}

export function create({ selectionUnit }: SelectionOptions): Reactive<Selection> {
  return reactive({
    range: null,
    unit: selectionUnit,
    type: 'cell' as SelectionType,
    intervalIdForAutoScroll: null
  });
}
