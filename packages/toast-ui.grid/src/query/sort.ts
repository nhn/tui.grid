import { Store } from '@t/store';
import { GridEventProps } from '@t/event';
import { SortState } from '@t/store/data';
import GridEvent from '../event/gridEvent';
import { findPropIndex, deepCopy } from '../helper/common';

// @TODO: 'sort', 'filter' event will be deprecated
export type EventType = 'beforeSort' | 'beforeUnsort' | 'afterSort' | 'afterUnsort' | 'sort';
export interface EventParams {
  columnName: string;
  ascending?: boolean;
  multiple?: boolean;
  sortState: SortState;
}

export function isCancelSort(
  { data, column }: Store,
  columnName: string,
  ascending: boolean,
  cancelable: boolean
) {
  const index = findPropIndex('columnName', columnName, data.sortState.columns);
  const defaultAscending = column.allColumnMap[columnName].sortingType === 'asc';

  return cancelable && ascending === defaultAscending && index !== -1;
}

export function createSortEvent(eventType: EventType, eventParams: EventParams) {
  const { columnName, multiple, ascending } = eventParams;
  const sortState = deepCopy(eventParams.sortState);
  let props: GridEventProps = {};

  /* eslint-disable no-fallthrough */
  switch (eventType) {
    /**
     * Occurs before sorting.
     * @event Grid#beforeSort
     * @property {Object} sortState - Current sort state
     * @property {string} columnName - Target column name
     * @property {boolean} ascending - Next ascending state of a column.
     * If the event is not stopped this ascending state will be applied to grid.
     * @property {boolean} multiple - Whether to use multiple sort
     * @property {Grid} instance - Current grid instance
     */
    case 'beforeSort':
      props = {
        sortState,
        columnName,
        ascending,
        multiple,
      };
      break;
    /**
     * Occurs before unsorting.
     * @event Grid#beforeUnsort
     * @property {Object} sortState - Current sort state of the grid
     * @property {string} columnName - Target column name
     * @property {boolean} multiple - Whether to use multiple sort
     * @property {Grid} instance - Current grid instance
     */
    case 'beforeUnsort':
      props = {
        sortState,
        columnName,
        multiple,
      };
      break;
    /**
     * Occurs after sorting.
     * @deprecated
     * @event Grid#sort
     * @property {Object} sortState - sort state
     * @property {string} columnName - Target column name
     * @property {Grid} instance - Current grid instance
     */
    case 'sort':
    /**
     * Occurs after sorting.
     * @event Grid#afterSort
     * @property {Object} sortState - sort state
     * @property {string} columnName - Target column name
     * @property {Grid} instance - Current grid instance
     */
    case 'afterSort':
    /**
     * Occurs after unsorting.
     * @event Grid#afterUnsort
     * @property {Object} sortState - sort state
     * @property {string} columnName - Target column name
     * @property {Grid} instance - Current grid instance
     */
    case 'afterUnsort':
      props = {
        sortState,
        columnName,
      };
      break;
    default: // do nothing
  }
  /* eslint-disable no-fallthrough */

  return new GridEvent(props);
}
