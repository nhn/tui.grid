import { Store } from '../store/types';

export function setWidth({ dimension }: Store, width: number) {
  dimension.width = width;
}
