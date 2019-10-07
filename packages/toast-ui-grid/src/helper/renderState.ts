import { Row } from '../store/types';

export function getRenderState(rawData: Row[]) {
  return rawData.length ? 'DONE' : 'EMPTY';
}
