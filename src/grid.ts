import { IGridOptions } from './types';
import { createStore, IStore } from './store/index';
import RootView from './view/root';

export default class Grid {
  private el: HTMLElement;

  constructor(options: IGridOptions) {
    this.el = options.el;
    const store = createStore(options);
    const rootView = new RootView(store);

    rootView.render();
  }
}