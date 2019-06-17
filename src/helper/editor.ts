import { isEmpty } from './common';
import { CellEditorProps, ListItemOptions } from '../editor/types';

export function getListItems(props: CellEditorProps) {
  const { listItems, relationListItemMap } = props.columnInfo.editor!.options as ListItemOptions;

  if (!isEmpty(relationListItemMap) && Array.isArray(relationListItemMap![props.rowKey])) {
    return relationListItemMap![props.rowKey];
  }

  return listItems;
}
