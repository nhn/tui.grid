import { Store } from '../store/types';

export function setScrollX({ viewport }: Store, scrollX: number) {
  viewport.scrollX = scrollX;
}

export function setScrollY({ viewport }: Store, scrollY: number) {
  viewport.scrollY = scrollY;
}
