import TuiGrid from '@t/index';
import { TargetType, GridEventProps, TuiGridEvent } from '@t/event';
import { findParentByTagName, getCellAddress, dataAttr } from '../helper/dom';
import { assign, pruneObject } from '../helper/common';
import { isRowHeader } from '../helper/column';

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
      columnName = cell.getAttribute(dataAttr.COLUMN_NAME) as string;
      targetType = 'columnHeader';
    }
  }

  return pruneObject({
    nativeEvent,
    targetType,
    rowKey,
    columnName,
  });
}

/**
 * Event class for public event of Grid
 * @module event/gridEvent
 * @param {Object} data - Event data for handler
 */
export default class GridEvent implements TuiGridEvent {
  private stopped = false;

  public constructor({ event, ...props }: GridEventProps = {}) {
    if (event) {
      this.assignData(getTargetInfo(event));
    }
    if (props) {
      this.assignData(props);
    }
  }

  /**
   * Stops propogation of this event.
   * @memberof event/gridEvent
   */
  public stop() {
    this.stopped = true;
  }

  public isStopped(): boolean {
    return this.stopped;
  }

  public assignData(data: GridEventProps) {
    assign(this, data);
  }

  public setInstance(instance: TuiGrid) {
    assign(this, { instance });
  }
}
