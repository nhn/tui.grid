import { options } from 'preact';

export function forceSyncRendering(fn: Function) {
  options.debounceRendering = f => f();
  fn();
  delete options.debounceRendering;
}
