import { options } from 'preact';

export function occurSyncRendering(fn: Function) {
  options.debounceRendering = f => f();
  fn();
  delete options.debounceRendering;
}
