import { IGridOptions } from './types';
import { createStore, IStore } from './store/index';
import { Root } from './view/root';
import { h, Component, render } from 'preact';

export default class Grid {
  constructor(options: IGridOptions) {
    const { el } = options;
    const store = createStore(options);

    render(<Root />, el);
  }
}