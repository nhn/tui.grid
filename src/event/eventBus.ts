import { removeArrayItem } from '../helper/common';
import GridEvent from './gridEvent';
import { getInstance } from '../instance';

const eventBusMap: { [id: number]: EventBus } = {};

export interface EventBus {
  on: Function;
  off: Function;
  trigger: Function;
}

export function createEventBus(id: number) {
  const eventMap: { [eventName: string]: Function[] } = {};
  eventBusMap[id] = {
    on(eventName: string, func: Function) {
      if (eventMap[eventName]) {
        eventMap[eventName] = [...eventMap[eventName], func];
      } else {
        eventMap[eventName] = [func];
      }
    },

    off(eventName: string, func?: Function) {
      const eventList = eventMap[eventName];
      if (eventList) {
        if (func) {
          eventMap[eventName] = removeArrayItem(func, eventList);
        } else {
          delete eventMap[eventName];
        }
      }
    },

    trigger(eventName: string, gridEvent: GridEvent) {
      const instance = getInstance(id);
      if (eventMap[eventName]) {
        eventMap[eventName].forEach((func) => {
          func({ instance, ...gridEvent.data });
        });
      }
    }
  };

  return eventBusMap[id];
}

export function getEventBus(id: number) {
  return eventBusMap[id];
}
