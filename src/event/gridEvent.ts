import { findParentByTagName, getCellAddress } from '../helper/dom';
import { RowKey, SelectionRange } from '../store/types';
import { deepAssign, isMetaColumn, pruneObject } from '../helper/common';
import Grid from '../grid';

// @TODO: 가이드하기. rowHead -> rowHeader / columnHead -> columnHeader
type TargetType = 'rowHeader' | 'columnHeader' | 'dummy' | 'cell' | 'etc';

interface TargetInfo {
  nativeEvent?: Event;
  targetType?: TargetType;
  rowKey?: RowKey;
  columnName?: string;
  instance?: Grid;
  columnNames?: string[];
  rowKeys?: RowKey[];
  httpStatus?: number;
  requestType?: string;
  requestParameter?: string;
  descendantRowKeys?: RowKey[];
  responseData?: object;
  prevRowKey?: RowKey;
  prevColumnName?: string;
  range?: SelectionRange;
}

export default class GridEvent {
  private stopped = false;

  public data: TargetInfo;

  private getTargetInfo(event: Event) {
    let targetType: TargetType = 'etc';
    const target = event.target as HTMLElement;
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
      nativeEvent: event,
      targetType,
      rowKey,
      columnName
    });
  }

  public constructor(event: Event, el?: HTMLElement) {
    this.data = this.getTargetInfo(event);
  }

  public stop() {
    this.stopped = true;
  }

  public isStopped(): boolean {
    return this.isStopped();
  }

  public setData(data: TargetInfo) {
    this.data = deepAssign(this.data, data);
  }
}
