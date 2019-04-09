import { Store } from '../store/types';

export function setScroll({ viewport }: Store, scrollX: number, scrollY: number) {
  viewport.scrollX = scrollX;
  viewport.scrollY = scrollY;
}
