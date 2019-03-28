import * as viewport from './viewport';
import { Action } from './types';
import { Store } from '../store/types';

const dispatchMap = { ...viewport };

export function createDispatcher(store: Store) {
  return function (action: Action) {
    // @ts-ignore
    dispatchMap[action.type](store, action);
  }
}
