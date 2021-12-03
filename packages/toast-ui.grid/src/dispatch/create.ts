import * as viewport from './viewport';
import * as dimension from './dimension';
import * as data from './data';
import * as column from './column';
import * as keyboard from './keyboard';
import * as mouse from './mouse';
import * as focus from './focus';
import * as summary from './summary';
import * as selection from './selection';
import * as renderState from './renderState';
import * as tree from './tree';
import * as sort from './sort';
import * as filter from './filter';
import * as pagination from './pagination';
import * as contextMenu from './contextMenu';
import * as exportData from './export';
import * as rowSpan from './rowSpan';
import { Store } from '@t/store';

const dispatchMap = {
  ...viewport,
  ...dimension,
  ...data,
  ...column,
  ...mouse,
  ...focus,
  ...keyboard,
  ...summary,
  ...selection,
  ...renderState,
  ...tree,
  ...sort,
  ...filter,
  ...pagination,
  ...contextMenu,
  ...exportData,
  ...rowSpan,
};

type DispatchMap = typeof dispatchMap;
type DispatchFnKeys = keyof DispatchMap;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RestParameters<T> = T extends (first: any, ...args: infer P) => any ? P : never;

export interface Dispatch {
  <T extends DispatchFnKeys>(fname: T, ...args: RestParameters<DispatchMap[T]>): void;
}

export interface DispatchProps {
  dispatch: Dispatch;
}

export function createDispatcher(store: Store): Dispatch {
  return function dispatch(fname, ...args) {
    // @ts-ignore
    dispatchMap[fname](store, ...args);
  };
}
