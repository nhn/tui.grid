import { findParentByTagName, getCellAddress } from '../helper/dom';
import { CellValue, RowKey, SelectionRange } from '../store/types';
import { XHROptions } from '../dataSource/types';
import { assign, pruneObject } from '../helper/common';
import { isRowHeader } from '../helper/column';
import Grid from '../grid';

type TargetType = 'rowHeader' | 'columnHeader' | 'dummy' | 'cell' | 'etc';

interface GridEventProps {
  value?: CellValue;
  event?: MouseEvent;
  rowKey?: RowKey | null;
  columnName?: string | null;
  prevRowKey?: RowKey | null;
  prevColumnName?: string | null;
  range?: SelectionRange | null;
  xhr?: XMLHttpRequest;
  options?: XHROptions;
}

function getTargetInfo(nativeEvent: MouseEvent) {
  let targetType: TargetType = 'etc';
  const target = nativeEvent.target as HTMLElement;
  let cell = findParentByTagName(target, 'td');
  let rowKey, columnName;

  if (cell) {
    const address = getCellAddress(cell);
    if (address) {
      rowKey = address.rowKey;
      columnName = address.columnName;
      targetType = isRowHeader(address.columnName) ? 'rowHeader' : 'cell';
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
      this.assignData(getTargetInfo(event));
    }
    if (props) {
      this.assignData(props);
    }
  }

  public stop() {
    this.stopped = true;
  }

  public isStopped(): boolean {
    return this.stopped;
  }

  public assignData(data: GridEventProps) {
    assign(this, data);
  }

  public setInstance(instance: Grid) {
    assign(this, { instance });
  }
}
