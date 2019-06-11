import { FormatterProps, CellValue, ListItem } from '../store/types';
import { findProp } from '../helper/common';

interface ListItemOptions {
  type: 'checkbox' | 'radio' | 'select';
  listItems: ListItem[];
}

function getListItemText(listItems: ListItem[], value: CellValue) {
  const item = findProp('value', value, listItems);
  return item ? item.text : '';
}

export function listItemText({ column, value }: FormatterProps) {
  const { type, listItems } = column.editor!.options as ListItemOptions;
  if (type === 'checkbox') {
    return String(value)
      .split(',')
      .map(getListItemText.bind(null, listItems))
      .join(',');
  }
  return getListItemText(listItems, value);
}
