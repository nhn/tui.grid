import { removeArrayItem } from '../helper/common';
import GridEvent from './gridEvent';
import { getInstance } from '../instance';
import { GridId } from '../store/types';

const eventBusMap: { [id: number]: EventBus } = {};

export interface EventBus {
  on: Function;
  off: Function;
  trigger: Function;
}

export function createEventBus(id: GridId) {
  const listenersMap: { [eventName: string]: Function[] } = {};
  eventBusMap[id] = {
    on(eventName: string, func: Function) {
      const listeners = listenersMap[eventName];
      listenersMap[eventName] = listeners ? [...listeners, func] : [func];
    },

    off(eventName: string, func?: Function) {
      const listeners = listenersMap[eventName];
      if (listeners) {
        if (func) {
          listenersMap[eventName] = removeArrayItem(func, listeners);
        } else {
          delete listenersMap[eventName];
        }
      }
    },

    trigger(eventName: string, gridEvent: GridEvent) {
      if (listenersMap[eventName]) {
        const instance = getInstance(id);
        gridEvent.setInstance(instance);
        listenersMap[eventName].forEach(func => {
          func(gridEvent);
        });
      }
    }
  };

  return eventBusMap[id];
}

export function getEventBus(id: GridId) {
  return eventBusMap[id];
}
