import { findParentByTagName, getCellAddress } from '../helper/dom';
import { RowKey, SelectionRange } from '../store/types';
import { assign, isMetaColumn, pruneObject } from '../helper/common';
import Grid from '../grid';

type TargetType = 'rowHeader' | 'columnHeader' | 'dummy' | 'cell' | 'etc';

interface GridEventProps {
  event?: MouseEvent;
  rowKey?: RowKey | null;
  columnName?: string | null;
  prevRowKey?: RowKey | null;
  prevColumnName?: string | null;
  range?: SelectionRange | null;
}

function getTargetInfo(nativeEvent: MouseEvent) {
  let targetType: TargetType = 'etc';
  const target = nativeEvent.target as HTMLElement;
  let cell = findParentByTagName(target, 'td');
  let rowKey, columnName;

  if (cell) {
    const address = getCellAddress(cell);
    if (address) {
      // eslint-disable-next-line prefer-destructuring
      rowKey = address.rowKey;
      // eslint-disable-next-line prefer-destructuring
      columnName = address.columnName;
      if (isMetaColumn(address.columnName)) {
        targetType = 'rowHeader';
      } else {
        targetType = 'cell';
      }
    } else {
      targetType = 'dummy';
    }
  } else {
    cell = findParentByTagName(target, 'th');
    if (cell) {
      columnName = cell.getAttribute('data-column-name') as string;
      targetType = 'columnHeader';
    }
  }

  return pruneObject({
    nativeEvent,
    targetType,
    rowKey,
    columnName
  });
}

export default class GridEvent {
  private stopped = false;

  public constructor({ event, ...props }: GridEventProps) {
    if (event) {
      this.setData(getTargetInfo(event));
    }
    if (props) {
      this.setData(props);
    }
  }

  public stop() {
    this.stopped = true;
  }

  public isStopped(): boolean {
    return this.stopped;
  }

  public setData(data: GridEventProps) {
    assign(this, data);
  }

  public setInstance(instance: Grid) {
    assign(this, { instance });
  }
}
