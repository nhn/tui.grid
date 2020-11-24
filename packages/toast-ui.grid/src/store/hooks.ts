import { observable } from '../helper/observable';
import { Hooks } from '@t/options';

export function create(hooks: Hooks) {
  return observable<Hooks>({
    event: {
      ...hooks.event,
    },
  });
}
