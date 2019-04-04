import { Store } from '../store/types';

export function setWidth({ dimension }: Store, width: number, autoWidth: boolean) {
  dimension.autoWidth = autoWidth;
  dimension.width = width;
}

export function setColumnWidth({ columns }: Store, index: number, width: number) {
  const column = columns[index];

  column.baseWidth = width;
  column.fixedWidth = true;
}
