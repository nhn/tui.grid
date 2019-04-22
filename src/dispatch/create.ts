import * as viewport from './viewport';
import * as dimension from './dimension';
import * as mouse from './mouse';
import * as column from './column';
import { Store } from '../store/types';

const dispatchMap = { ...viewport, ...dimension, ...column, ...mouse };

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
