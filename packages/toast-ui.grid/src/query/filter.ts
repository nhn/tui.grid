import { Store } from '@t/store';
import { FilterOptionType, OperatorType, FilterState } from '@t/store/filterLayerState';
import { GridEventProps } from '@t/event';
import { deepCopyArray } from '../helper/common';
import GridEvent from '../event/gridEvent';

// @TODO: 'filter' event will be deprecated
export type EventType =
  | 'beforeFilter'
  | 'beforeUnfilter'
  | 'afterFilter'
  | 'afterUnfilter'
  | 'filter';
export interface EventParams {
  columnName: string | null;
  type?: FilterOptionType;
  operator?: OperatorType;
  conditionFn?: Function;
  state?: FilterState[];
}

export function getFilterState(store: Store) {
  const { filters } = store.data;

  if (filters) {
    deepCopyArray(filters);
  }
  return filters;
}

export function createFilterEvent({ data }: Store, eventType: EventType, eventParams: EventParams) {
  const { columnName, type, conditionFn, state, operator } = eventParams;
  const filterState = data.filters ? deepCopyArray(data.filters) : null;
  let props: GridEventProps = {};

  /* eslint-disable no-fallthrough */
  switch (eventType) {
    /**
     * Occurs before filtering.
     * @event Grid#beforeFilter
     * @property {Grid} instance - Current grid instance
     * @property {Object} filterState - Current filter state
     * @property {string} columnName - Target column name
     * @property {string} type - Column Filter type
     * @property {string} operator - Column filter Operator('AND' | 'OR')
     * @property {function} conditionFn - Original function to filter the data in grid.
     * @property {Array} columnFilterState - Next filter state of column which triggers the event.
     * If the event is not stopped this state will be applied to grid.
     */
    case 'beforeFilter':
      props = {
        filterState,
        columnFilterState: deepCopyArray(state!),
        conditionFn,
        type,
        columnName,
        operator,
      };
      break;
    /**
     * Occurs before unfiltering
     * @event Grid#beforeUnfilter
     * @property {Grid} instance - Current grid instance
     * @property {string} columnName - Target column name
     * @property {Object} filterState - Current filter state
     */
    case 'beforeUnfilter':
    /**
     * Occurs after filtering
     * @deprecated
     * @event Grid#filter
     * @property {Grid} instance - Current grid instance
     * @property {string} columnName - Target column name
     * @property {Object} filterState - Current filter state
     */
    case 'filter':
    /**
     * Occurs after filtering
     * @event Grid#afterFilter
     * @property {Grid} instance - Current grid instance
     * @property {string} columnName - Target column name
     * @property {Object} filterState - Current filter state
     */
    case 'afterFilter':

    /**
     * Occurs after unfiltering
     * @event Grid#afterUnfilter
     * @property {Grid} instance - Current grid instance
     * @property {string} columnName - Target column name
     * @property {Object} filterState - Current filter state
     */
    case 'afterUnfilter':
      props = {
        filterState,
        columnName,
      };
      break;
    default: // do nothing
  }
  /* eslint-disable no-fallthrough */

  return new GridEvent(props);
}
