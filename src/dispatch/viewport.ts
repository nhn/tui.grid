import { Store } from '../store/types';
import { SetScrollAction } from './types';

export function setScroll(store: Store, action: SetScrollAction) {
  const { scrollX, scrollY } = action;
  const { viewport } = store;

  viewport.scrollX = scrollX;
  viewport.scrollY = scrollY;
};