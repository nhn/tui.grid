import { Store } from '../store/types';
import { SetScrollAction, SetRowHeight } from './types';

export function setScroll({ viewport }: Store, { scrollX, scrollY }: SetScrollAction) {
  viewport.scrollX = scrollX;
  viewport.scrollY = scrollY;
};

export function setRowHeight({ dimension }: Store, { height }: SetRowHeight) {
  dimension.rowHeight = height;
}