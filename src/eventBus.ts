import { removeArrayItem } from './helper/common';

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

    trigger(eventName: string) {
      if (eventMap[eventName]) {
        eventMap[eventName].forEach((func) => {
          // @TODO: gridEvent 넣어주기
          func();
        });
      }
    }
  };

  return eventBusMap[id];
}

export function getEventBus(id: number) {
  return eventBusMap[id];
}
