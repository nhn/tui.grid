import { OptGrid } from './types';
import { createStore } from './store/create';
import { Root } from './view/root';
import { h, Component, render } from 'preact';
import { createDispatcher } from './dispatch/create';

if (module.hot) {
  require('preact/devtools');
}

export default class Grid {
  constructor(options: OptGrid) {
    const { el } = options;
    const store = createStore(options);
    const dispatch = createDispatcher(store);

    render(<Root store={store} dispatch={dispatch} />, el);
  }
}
