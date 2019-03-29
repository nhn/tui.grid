import { Store } from '../store/types';
import { SetScrollAction, SetRowHeight, SetWidth } from './types';

export function setScroll({ viewport }: Store, { scrollX, scrollY }: SetScrollAction) {
  viewport.scrollX = scrollX;
  viewport.scrollY = scrollY;
};

export function setRowHeight({ dimension }: Store, { height }: SetRowHeight) {
  dimension.rowHeight = height;
}

export function setWidth({dimension} : Store, { width } : SetWidth) {
  dimension.width = width;
}

