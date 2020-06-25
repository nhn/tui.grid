import { GridEventName, GridEventListener } from '@t/options';
import { GridId } from '@t/store';
import GridEvent from './gridEvent';
import { removeArrayItem } from '../helper/common';
import { getInstance } from '../instance';

type TargetEventName = GridEventName | 'onGridMounted' | 'onGridBeforeDestroy' | 'onGridUpdated';
const eventBusMap: { [id: number]: EventBus } = {};

export interface EventBus {
  on: (eventName: TargetEventName, fn: GridEventListener) => void;
  off: (eventName: TargetEventName, fn?: GridEventListener) => void;
  trigger: (eventName: TargetEventName, gridEvent: GridEvent) => void;
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
        listenersMap[eventName].forEach((func) => {
          func(gridEvent);
        });
      }
    },
  };

  return eventBusMap[id];
}

export function getEventBus(id: GridId) {
  return eventBusMap[id];
}
