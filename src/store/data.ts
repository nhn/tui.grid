import { Data, Row } from './types';
import { reactive, Reactive } from '../helper/reactive';
import { OptRow } from '../types';

export function create(data: OptRow[]): Reactive<Data> {
  const rawData: Row[] = <Row[]>data;
  rawData.forEach((row, idx) => {
    row.rowKey = idx;
  });

  return reactive({
    rawData,
    viewData: rawData
  });
}
