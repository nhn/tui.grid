import { FilterItemClass } from './types';
import { SingleFilterOptionType } from '../types';
import { TextFilter } from './text';
import { SelectFilter } from './select';
import { DatePickerFilter } from './datePicker';

export interface FilterItemMap {
  [editorName: string]: { filterClass: FilterItemClass; type: SingleFilterOptionType };
}

export const filterMap: FilterItemMap = {
  text: { filterClass: TextFilter, type: 'text' },
  number: { filterClass: TextFilter, type: 'number' },
  select: { filterClass: SelectFilter, type: 'select' },
  date: { filterClass: DatePickerFilter, type: 'date' }
};
