import { EventName, EventCallback } from '../../types/options';
import { GridId } from '../../types/store/store';
import { removeArrayItem } from '../helper/common';
import GridEvent from './gridEvent';
import { getInstance } from '../instance';

type TargetEventName = EventName | 'onGridMounted' | 'onGridBeforeDestroy' | 'onGridUpdated';
const eventBusMap: { [id: number]: EventBus } = {};

export interface EventBus {
  on: (eventName: TargetEventName, fn: EventCallback) => void;
  off: (eventName: TargetEventName, fn?: EventCallback) => void;
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
