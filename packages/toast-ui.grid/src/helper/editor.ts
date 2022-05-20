import { CellEditorProps, ListItemOptions } from '@t/editor';
import { isEmpty } from './common';

export function getListItems(props: CellEditorProps) {
  const { listItems, relationListItemMap } =
    (props.columnInfo.editor!.options as ListItemOptions) ?? {};

  if (!isEmpty(relationListItemMap) && Array.isArray(relationListItemMap![props.rowKey])) {
    return relationListItemMap![props.rowKey];
  }

  return listItems;
}
