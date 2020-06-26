import { ListItem, FormatterProps } from '@t/store/column';
import { CellValue } from '@t/store/data';
import { findProp } from '../helper/common';

interface ListItemOptions {
  type: 'checkbox' | 'radio' | 'select';
  listItems: ListItem[];
}

function getListItemText(listItems: ListItem[], value: CellValue) {
  const item = findProp('value', value, listItems);
  return item ? item.text : '';
}

export function listItemText({ column, value }: FormatterProps, relationListItems?: ListItem[]) {
  const { type } = column.editor!.options as ListItemOptions;
  let { listItems } = column.editor!.options as ListItemOptions;

  if (Array.isArray(relationListItems)) {
    listItems = relationListItems;
  }
  if (type === 'checkbox') {
    return String(value)
      .split(',')
      .map(getListItemText.bind(null, listItems))
      .filter((text) => Boolean(text))
      .join(',');
  }
  return getListItemText(listItems, value);
}
